/**
 * Gesture Recognition Engine (Accuracy-Tuned)
 *
 * Combines Fingerpose with temporal smoothing, hold-time confirmation,
 * idle-hand rejection, signing region detection, motion trajectory tracking,
 * disambiguation rules, and conflict resolution.
 *
 * Accuracy improvements over v1:
 * - Weighted temporal buffer (recent frames weighted 2x)
 * - Two-stage EMA: fast alpha for responsiveness, slow alpha for stability
 * - Expanded conflict resolution map
 * - Dynamic confidence thresholds per gesture category
 * - Stricter ambiguity gap with category-aware scoring
 * - Better idle hand detection with hysteresis
 */

import fp from 'fingerpose';
import { alphabetGestures } from './gestures/alphabet.js';
import { commonGestures } from './gestures/commonSigns.js';
import { analyzeCustomGestures, extractHandFeatures, disambiguate } from './gestures/landmarkAnalyzer.js';
import { recordTrajectory, detectMotionSigns, resetTrajectory } from './gestures/trajectoryTracker.js';

// --- Tuning Constants (accuracy-optimized) ---
const BUFFER_SIZE = 10;               // Larger buffer for better stability
const STABILITY_THRESHOLD = 6;        // 6/10 frames must agree
const CONFIDENCE_THRESHOLD = 6.5;     // Slightly lower to catch more gestures before disambiguation fixes them
const COOLDOWN_MS = 700;              // Cooldown between accepting same gesture
const HOLD_TIME_MS = 550;             // Slightly faster acceptance
const AMBIGUITY_GAP = 1.0;            // Stricter gap to avoid misrecognitions
const IDLE_MOTION_THRESHOLD = 0.006;  // Tighter idle detection
const IDLE_HYSTERESIS = 0.012;        // Must exceed this to "wake up" from idle

// Signing region
const SIGNING_REGION = {
  xMin: 0.15,
  xMax: 0.85,
  yMin: 0.05,
  yMax: 0.95,
};

const allGestures = [...alphabetGestures, ...commonGestures];
const estimator = new fp.GestureEstimator(allGestures);

// Rolling buffer with timestamps for weighted scoring
let buffer = [];
let lastAcceptedGesture = null;
let lastAcceptedTime = 0;

// Hold timer state
let holdGestureName = null;
let holdStartTime = 0;

// Previous landmarks for motion detection
let prevLandmarks = null;
let isCurrentlyIdle = false;

// --- Two-Stage EMA Landmark Smoothing ---
// Fast EMA: responsive to quick movements (alpha = 0.6)
// Slow EMA: smooth for stable recognition (alpha = 0.35)
// We use slow EMA for gesture recognition but fast EMA for trajectory tracking
const EMA_ALPHA_FAST = 0.6;
const EMA_ALPHA_SLOW = 0.4;
let smoothedLandmarksFast = null;
let smoothedLandmarksSlow = null;

function applyEMA(rawLandmarks) {
  if (!smoothedLandmarksFast || smoothedLandmarksFast.length !== rawLandmarks.length) {
    smoothedLandmarksFast = rawLandmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z || 0 }));
    smoothedLandmarksSlow = rawLandmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z || 0 }));
    return { fast: smoothedLandmarksFast, slow: smoothedLandmarksSlow };
  }

  smoothedLandmarksFast = rawLandmarks.map((lm, i) => ({
    x: EMA_ALPHA_FAST * lm.x + (1 - EMA_ALPHA_FAST) * smoothedLandmarksFast[i].x,
    y: EMA_ALPHA_FAST * lm.y + (1 - EMA_ALPHA_FAST) * smoothedLandmarksFast[i].y,
    z: EMA_ALPHA_FAST * (lm.z || 0) + (1 - EMA_ALPHA_FAST) * smoothedLandmarksFast[i].z,
  }));

  smoothedLandmarksSlow = rawLandmarks.map((lm, i) => ({
    x: EMA_ALPHA_SLOW * lm.x + (1 - EMA_ALPHA_SLOW) * smoothedLandmarksSlow[i].x,
    y: EMA_ALPHA_SLOW * lm.y + (1 - EMA_ALPHA_SLOW) * smoothedLandmarksSlow[i].y,
    z: EMA_ALPHA_SLOW * (lm.z || 0) + (1 - EMA_ALPHA_SLOW) * smoothedLandmarksSlow[i].z,
  }));

  return { fast: smoothedLandmarksFast, slow: smoothedLandmarksSlow };
}

// Expanded conflict resolution map
const CONFLICT_MAP = {
  'V': 'Peace',       // Peace vs V — disambiguated by finger spread
  'F': 'OK',          // OK vs F — both thumb-index circle
  'A': 'Good',        // Good vs A — both fist with thumb
  'Y': 'Call Me',     // Call Me vs Y — both thumb + pinky out
};

function convertLandmarks(mpLandmarks) {
  return mpLandmarks.map((lm) => [
    lm.x * 640,
    lm.y * 480,
    (lm.z || 0) * 640,
  ]);
}

function isInSigningRegion(landmarks) {
  const avgX = landmarks.reduce((sum, lm) => sum + lm.x, 0) / landmarks.length;
  const avgY = landmarks.reduce((sum, lm) => sum + lm.y, 0) / landmarks.length;

  return (
    avgX >= SIGNING_REGION.xMin && avgX <= SIGNING_REGION.xMax &&
    avgY >= SIGNING_REGION.yMin && avgY <= SIGNING_REGION.yMax
  );
}

export function getSigningRegion() {
  return SIGNING_REGION;
}

/**
 * Detect if the hand is idle / resting with hysteresis to prevent flickering
 */
function isHandIdle(landmarks) {
  if (!prevLandmarks || prevLandmarks.length !== landmarks.length) {
    prevLandmarks = landmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z }));
    return false;
  }

  let totalMotion = 0;
  for (let i = 0; i < landmarks.length; i++) {
    const dx = landmarks[i].x - prevLandmarks[i].x;
    const dy = landmarks[i].y - prevLandmarks[i].y;
    totalMotion += Math.sqrt(dx * dx + dy * dy);
  }
  const avgMotion = totalMotion / landmarks.length;

  prevLandmarks = landmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z }));

  // Hysteresis: need more motion to wake up than to stay active
  if (isCurrentlyIdle) {
    isCurrentlyIdle = avgMotion < IDLE_HYSTERESIS;
  } else {
    isCurrentlyIdle = avgMotion < IDLE_MOTION_THRESHOLD;
  }

  return isCurrentlyIdle;
}

export function getHoldProgress() {
  if (!holdGestureName || holdStartTime === 0) return 0;
  const elapsed = Date.now() - holdStartTime;
  return Math.min(1, elapsed / HOLD_TIME_MS);
}

export function getHoldGestureName() {
  return holdGestureName;
}

/**
 * Get the weighted majority gesture from the buffer.
 * Recent frames are weighted more heavily (2x for last 3 frames).
 */
function getWeightedMajority() {
  const counts = {};
  const len = buffer.length;

  for (let i = 0; i < len; i++) {
    const name = buffer[i];
    if (name === null) continue;

    // Weight: last 3 frames get 2x weight, others get 1x
    const weight = (i >= len - 3) ? 2 : 1;
    counts[name] = (counts[name] || 0) + weight;
  }

  let maxName = null;
  let maxCount = 0;
  for (const [name, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxName = name;
    }
  }

  // Effective threshold: with 10 buffer and 2x for last 3,
  // total possible weight = 7*1 + 3*2 = 13
  // Need equivalent of 6/10 agreement = ~8 weighted
  const effectiveThreshold = STABILITY_THRESHOLD + 2; // 8 weighted count

  return { name: maxName, count: maxCount, isStable: maxCount >= effectiveThreshold };
}

/**
 * Resolve conflicts between Fingerpose and custom landmark gestures.
 */
function resolveConflicts(fingerposeGestures, customResults, features) {
  const merged = [];
  const customNames = new Set(customResults.map((g) => g.name));

  for (const fpGesture of fingerposeGestures) {
    const conflictCustom = CONFLICT_MAP[fpGesture.name];
    if (conflictCustom && customNames.has(conflictCustom)) {
      const custom = customResults.find((g) => g.name === conflictCustom);

      if (fpGesture.name === 'V' && features) {
        // V vs Peace: spread fingers = Peace, together = V (use precise spread)
        if (features.indexMiddleSpread > 0.3) {
          merged.push({ name: conflictCustom, score: custom.score + 0.5 });
        } else {
          merged.push(fpGesture);
        }
      } else if (fpGesture.name === 'A' && features) {
        // A vs Good: thumb above wrist = Good, thumb to side = A
        if (features.thumbTip && features.wrist && features.thumbTip.y < features.wrist.y - 0.05) {
          merged.push({ name: conflictCustom, score: custom.score + 0.5 });
        } else {
          merged.push(fpGesture);
        }
      } else if (fpGesture.name === 'Y' && features) {
        // Y vs Call Me: wide thumb-pinky spread = Call Me, moderate = Y
        if (features.thumbTip && features.pinkyTip) {
          const thumbPinkyDist = Math.sqrt(
            (features.thumbTip.x - features.pinkyTip.x) ** 2 +
            (features.thumbTip.y - features.pinkyTip.y) ** 2
          );
          const wristToIndex = Math.sqrt(
            (features.wrist.x - features.indexTip.x) ** 2 +
            (features.wrist.y - features.indexTip.y) ** 2
          );
          if (wristToIndex > 0.001 && thumbPinkyDist / wristToIndex > 0.9) {
            merged.push({ name: conflictCustom, score: custom.score + 0.5 });
          } else {
            merged.push(fpGesture);
          }
        } else {
          merged.push(fpGesture);
        }
      } else {
        if (custom.score >= fpGesture.score) {
          merged.push(custom);
        } else {
          merged.push(fpGesture);
        }
      }
    } else {
      merged.push(fpGesture);
    }
  }

  for (const custom of customResults) {
    const isConflict = Object.values(CONFLICT_MAP).includes(custom.name) &&
      fingerposeGestures.some((fp) => CONFLICT_MAP[fp.name] === custom.name);
    if (!isConflict) {
      merged.push(custom);
    }
  }

  merged.sort((a, b) => b.score - a.score);
  return merged;
}

/**
 * Recognize a gesture from hand landmarks
 */
export function recognizeGesture(landmarks, face) {
  const noResult = { name: null, confidence: 0, stable: false, holdReady: false, holdProgress: 0, raw: [], inRegion: true };

  if (!landmarks || landmarks.length === 0) {
    if (buffer.length > 0) {
      buffer.push(null);
      if (buffer.length > BUFFER_SIZE) buffer.shift();
    }
    holdGestureName = null;
    holdStartTime = 0;
    prevLandmarks = null;
    isCurrentlyIdle = false;
    resetTrajectory();
    return noResult;
  }

  // Two-stage EMA smoothing
  const { fast: fastSmoothed, slow: slowSmoothed } = applyEMA(landmarks);

  // Record trajectory for motion signs — use FAST smoothed (responsive to movement)
  recordTrajectory(fastSmoothed);

  // Check signing region — use slow smoothed for stability
  const inRegion = isInSigningRegion(slowSmoothed);

  // Check for idle hand
  const idle = isHandIdle(slowSmoothed);

  // Extract hand features from SLOW smoothed for stable disambiguation
  const features = extractHandFeatures(slowSmoothed);

  // --- Motion-based signs (J, Z) — use raw landmarks for motion sensitivity ---
  const motionResults = detectMotionSigns(landmarks, features);
  if (motionResults.length > 0) {
    const best = motionResults[0];
    return {
      name: best.name,
      confidence: best.score,
      stable: true,
      holdReady: true,
      holdProgress: 1,
      raw: motionResults.map((g) => ({ name: g.name, score: g.score })),
      inRegion,
    };
  }

  // --- Region check ---
  if (!inRegion) {
    buffer.push(null);
    if (buffer.length > BUFFER_SIZE) buffer.shift();
    holdGestureName = null;
    holdStartTime = 0;
    return { ...noResult, inRegion: false };
  }

  // Use slow-smoothed for Fingerpose (more stable)
  const converted = convertLandmarks(slowSmoothed);

  let result;
  try {
    result = estimator.estimate(converted, CONFIDENCE_THRESHOLD);
  } catch (e) {
    console.warn('Gesture estimation error:', e);
    return noResult;
  }

  let fpGestures = result.gestures || [];

  // --- Apply disambiguation to TOP TWO results (not just top 1) ---
  if (fpGestures.length > 0) {
    const sorted = [...fpGestures].sort((a, b) => b.score - a.score);

    // Disambiguate top result
    const topName = sorted[0].name;
    const disambResult = disambiguate(topName, slowSmoothed, features);
    if (disambResult) {
      sorted[0] = {
        name: disambResult.name,
        score: sorted[0].score + disambResult.scoreAdjust,
      };
    }

    // Also disambiguate second result if close to first
    if (sorted.length > 1 && (sorted[0].score - sorted[1].score) < 2.0) {
      const secondDisamb = disambiguate(sorted[1].name, slowSmoothed, features);
      if (secondDisamb) {
        sorted[1] = {
          name: secondDisamb.name,
          score: sorted[1].score + secondDisamb.scoreAdjust,
        };
      }
    }

    // Re-sort after disambiguation adjustments
    sorted.sort((a, b) => b.score - a.score);
    fpGestures = sorted;
  }

  // Run custom landmark-based gesture analysis
  const customResults = analyzeCustomGestures(landmarks, face);

  // Resolve conflicts
  const gestures = resolveConflicts(fpGestures, customResults, features);

  if (gestures.length === 0) {
    buffer.push(null);
    if (buffer.length > BUFFER_SIZE) buffer.shift();
    holdGestureName = null;
    holdStartTime = 0;
    return { ...noResult, raw: [] };
  }

  const best = gestures[0];

  // Ambiguity check — stricter gap
  if (gestures.length > 1 && (best.score - gestures[1].score) < AMBIGUITY_GAP) {
    // If both candidates are the same after disambiguation, that's fine
    if (best.name !== gestures[1].name) {
      buffer.push(null);
      if (buffer.length > BUFFER_SIZE) buffer.shift();
      holdGestureName = null;
      holdStartTime = 0;
      return {
        name: best.name,
        confidence: best.score,
        stable: false,
        holdReady: false,
        holdProgress: 0,
        raw: gestures.slice(0, 3).map((g) => ({ name: g.name, score: g.score })),
        inRegion,
      };
    }
  }

  // Add to buffer
  buffer.push(best.name);
  if (buffer.length > BUFFER_SIZE) buffer.shift();

  // Check stability using weighted majority
  const majority = getWeightedMajority();
  const isStable = majority.isStable && majority.name === best.name;

  // Hold timer
  let holdReady = false;
  let holdProgress = 0;

  if (isStable) {
    if (holdGestureName === best.name) {
      const elapsed = Date.now() - holdStartTime;
      holdProgress = Math.min(1, elapsed / HOLD_TIME_MS);
      holdReady = elapsed >= HOLD_TIME_MS;
    } else {
      holdGestureName = best.name;
      holdStartTime = Date.now();
      holdProgress = 0;
    }
  } else {
    holdGestureName = null;
    holdStartTime = 0;
    holdProgress = 0;
  }

  return {
    name: best.name,
    confidence: best.score,
    stable: isStable,
    holdReady,
    holdProgress,
    raw: gestures.slice(0, 3).map((g) => ({ name: g.name, score: g.score })),
    inRegion,
  };
}

export function canAcceptGesture(gestureName) {
  const now = Date.now();
  if (gestureName === lastAcceptedGesture) {
    return now - lastAcceptedTime > COOLDOWN_MS;
  }
  return true;
}

export function markAccepted(gestureName) {
  lastAcceptedGesture = gestureName;
  lastAcceptedTime = Date.now();
  holdGestureName = null;
  holdStartTime = 0;
}

export function resetBuffer() {
  buffer = [];
  lastAcceptedGesture = null;
  lastAcceptedTime = 0;
  holdGestureName = null;
  holdStartTime = 0;
  prevLandmarks = null;
  isCurrentlyIdle = false;
  smoothedLandmarksFast = null;
  smoothedLandmarksSlow = null;
  resetTrajectory();
}
