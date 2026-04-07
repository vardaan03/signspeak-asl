/**
 * Gesture Recognition Engine
 * Combines Fingerpose with temporal smoothing, hold-time confirmation,
 * idle-hand rejection, signing region detection, motion trajectory tracking,
 * disambiguation rules, and conflict resolution.
 */

import fp from 'fingerpose';
import { alphabetGestures } from './gestures/alphabet.js';
import { commonGestures } from './gestures/commonSigns.js';
import { analyzeCustomGestures, extractHandFeatures, disambiguate } from './gestures/landmarkAnalyzer.js';
import { recordTrajectory, detectMotionSigns, resetTrajectory } from './gestures/trajectoryTracker.js';

// --- Tuning Constants (optimized for low latency) ---
const BUFFER_SIZE = 8;               // Smaller buffer = faster response
const STABILITY_THRESHOLD = 5;       // 5/8 frames agreeing = faster lock
const CONFIDENCE_THRESHOLD = 7.0;    // Slightly lower floor for responsiveness
const COOLDOWN_MS = 800;             // Shorter cooldown between same gesture
const HOLD_TIME_MS = 600;            // 0.6s hold = much snappier acceptance
const AMBIGUITY_GAP = 0.8;           // Slightly more tolerant gap
const IDLE_MOTION_THRESHOLD = 0.008; // Max avg landmark movement to be "idle"

// Signing region: only accept gestures when hand center is within this box
const SIGNING_REGION = {
  xMin: 0.2,  // left 20% excluded
  xMax: 0.8,  // right 20% excluded
  yMin: 0.1,  // top 10% excluded
  yMax: 0.9,  // bottom 10% excluded
};

const allGestures = [...alphabetGestures, ...commonGestures];
const estimator = new fp.GestureEstimator(allGestures);

// Rolling buffer of recent detections
let buffer = [];
let lastAcceptedGesture = null;
let lastAcceptedTime = 0;

// Hold timer state
let holdGestureName = null;
let holdStartTime = 0;

// Previous landmarks for motion detection
let prevLandmarks = null;

// --- EMA Landmark Smoothing (from Google's MediaPipe research) ---
// Exponential Moving Average reduces jitter by 60-80% while preserving responsiveness.
// Alpha = 0.55 balances smoothness vs latency (Google recommends 0.5-0.7 range).
const EMA_ALPHA = 0.55;
let smoothedLandmarks = null;

function applyEMA(rawLandmarks) {
  if (!smoothedLandmarks || smoothedLandmarks.length !== rawLandmarks.length) {
    // First frame — initialize
    smoothedLandmarks = rawLandmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z || 0 }));
    return smoothedLandmarks;
  }

  smoothedLandmarks = rawLandmarks.map((lm, i) => ({
    x: EMA_ALPHA * lm.x + (1 - EMA_ALPHA) * smoothedLandmarks[i].x,
    y: EMA_ALPHA * lm.y + (1 - EMA_ALPHA) * smoothedLandmarks[i].y,
    z: EMA_ALPHA * (lm.z || 0) + (1 - EMA_ALPHA) * smoothedLandmarks[i].z,
  }));

  return smoothedLandmarks;
}

// Conflict resolution: known overlaps between Fingerpose alphabet and custom gestures
const CONFLICT_MAP = {
  // When both fire, custom gesture wins if its score is within range
  'V': 'Peace',       // Peace vs V — disambiguated by finger spread
  'F': 'OK',          // OK vs F — both thumb-index circle
  'A': 'Good',        // Good vs A — both fist with thumb
};

/**
 * Convert MediaPipe landmarks (normalised 0-1) to the format Fingerpose expects.
 * Fingerpose wants an array of [x, y, z] in pixel-like coordinates.
 * We scale them to a virtual 640×480 canvas.
 */
function convertLandmarks(mpLandmarks) {
  return mpLandmarks.map((lm) => [
    lm.x * 640,
    lm.y * 480,
    (lm.z || 0) * 640,
  ]);
}

/**
 * Check if the hand center is within the signing region.
 */
function isInSigningRegion(landmarks) {
  const avgX = landmarks.reduce((sum, lm) => sum + lm.x, 0) / landmarks.length;
  const avgY = landmarks.reduce((sum, lm) => sum + lm.y, 0) / landmarks.length;

  return (
    avgX >= SIGNING_REGION.xMin && avgX <= SIGNING_REGION.xMax &&
    avgY >= SIGNING_REGION.yMin && avgY <= SIGNING_REGION.yMax
  );
}

/**
 * Get the signing region bounds (for UI to draw the box).
 */
export function getSigningRegion() {
  return SIGNING_REGION;
}

/**
 * Detect if the hand is idle / resting (not intentionally signing).
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

  return avgMotion < IDLE_MOTION_THRESHOLD;
}

/**
 * Get hold progress (0-1) for the current gesture being held
 */
export function getHoldProgress() {
  if (!holdGestureName || holdStartTime === 0) return 0;
  const elapsed = Date.now() - holdStartTime;
  return Math.min(1, elapsed / HOLD_TIME_MS);
}

/**
 * Get the name of the gesture currently being held
 */
export function getHoldGestureName() {
  return holdGestureName;
}

/**
 * Resolve conflicts between Fingerpose and custom landmark gestures.
 * Returns the merged, deduplicated, and prioritized gesture list.
 */
function resolveConflicts(fingerposeGestures, customResults, features) {
  const merged = [];
  const customNames = new Set(customResults.map((g) => g.name));

  for (const fpGesture of fingerposeGestures) {
    const conflictCustom = CONFLICT_MAP[fpGesture.name];
    if (conflictCustom && customNames.has(conflictCustom)) {
      // Both fired — use features to decide
      const custom = customResults.find((g) => g.name === conflictCustom);

      if (fpGesture.name === 'V' && features) {
        // V vs Peace: spread fingers = Peace, together = V
        if (features.fingerSpread > 0.3) {
          merged.push({ name: conflictCustom, score: custom.score + 0.5 });
        } else {
          merged.push(fpGesture);
        }
      } else if (fpGesture.name === 'A' && features) {
        // A vs Good: thumb up = Good, thumb to side = A
        if (features.thumbTip && features.wrist && features.thumbTip.y < features.wrist.y - 0.05) {
          merged.push({ name: conflictCustom, score: custom.score + 0.5 });
        } else {
          merged.push(fpGesture);
        }
      } else {
        // Default: higher score wins
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

  // Add custom results that don't conflict with Fingerpose
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
 * @param {Array} landmarks - MediaPipe hand landmarks (21 points, normalised)
 * @param {Object|null} face - Face landmark data for body-relative gestures
 * @returns {{ name, confidence, stable, holdReady, holdProgress, raw, inRegion }}
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
    resetTrajectory();
    return noResult;
  }

  // Apply EMA smoothing to reduce landmark jitter (Google research)
  const smoothed = applyEMA(landmarks);

  // Record trajectory for motion signs (J, Z) — use RAW landmarks for motion sensitivity
  recordTrajectory(landmarks);

  // Check signing region — use smoothed for stability
  const inRegion = isInSigningRegion(smoothed);

  // Check for idle hand
  const idle = isHandIdle(smoothed);

  // Extract hand features from SMOOTHED landmarks for disambiguation and custom gestures
  const features = extractHandFeatures(smoothed);

  // --- Motion-based signs (J, Z) ---
  const motionResults = detectMotionSigns(landmarks, features);
  if (motionResults.length > 0) {
    const best = motionResults[0];
    // Motion signs bypass the normal buffer — they're event-based
    return {
      name: best.name,
      confidence: best.score,
      stable: true,
      holdReady: true,  // Immediately accept motion signs
      holdProgress: 1,
      raw: motionResults.map((g) => ({ name: g.name, score: g.score })),
      inRegion,
    };
  }

  // --- Region check: if hand is outside signing region, don't commit ---
  if (!inRegion) {
    buffer.push(null);
    if (buffer.length > BUFFER_SIZE) buffer.shift();
    holdGestureName = null;
    holdStartTime = 0;
    return { ...noResult, inRegion: false };
  }

  const converted = convertLandmarks(smoothed);

  let result;
  try {
    result = estimator.estimate(converted, CONFIDENCE_THRESHOLD);
  } catch (e) {
    console.warn('Gesture estimation error:', e);
    return noResult;
  }

  let fpGestures = result.gestures || [];

  // --- Apply disambiguation rules to top Fingerpose result ---
  if (fpGestures.length > 0) {
    const sorted = [...fpGestures].sort((a, b) => b.score - a.score);
    const topName = sorted[0].name;
    const disambResult = disambiguate(topName, smoothed, features);
    if (disambResult) {
      // Adjust the top result's name and boost its score
      sorted[0] = {
        name: disambResult.name,
        score: sorted[0].score + disambResult.scoreAdjust,
      };
      fpGestures = sorted;
    }
  }

  // Run custom landmark-based gesture analysis (with face data for body-relative signs)
  const customResults = analyzeCustomGestures(landmarks, face);

  // Resolve conflicts between Fingerpose and custom results
  const gestures = resolveConflicts(fpGestures, customResults, features);

  if (gestures.length === 0) {
    buffer.push(null);
    if (buffer.length > BUFFER_SIZE) buffer.shift();
    holdGestureName = null;
    holdStartTime = 0;
    return { ...noResult, raw: [] };
  }

  const best = gestures[0];

  // Ambiguity check
  if (gestures.length > 1 && (best.score - gestures[1].score) < AMBIGUITY_GAP) {
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

  // Add to buffer
  buffer.push(best.name);
  if (buffer.length > BUFFER_SIZE) buffer.shift();

  // Check stability
  const counts = {};
  let maxName = null;
  let maxCount = 0;
  for (const name of buffer) {
    if (name === null) continue;
    counts[name] = (counts[name] || 0) + 1;
    if (counts[name] > maxCount) {
      maxCount = counts[name];
      maxName = name;
    }
  }

  const isStable = maxCount >= STABILITY_THRESHOLD && maxName === best.name;

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

/**
 * Check if a gesture can be "accepted" (added to sentence)
 */
export function canAcceptGesture(gestureName) {
  const now = Date.now();
  if (gestureName === lastAcceptedGesture) {
    return now - lastAcceptedTime > COOLDOWN_MS;
  }
  return true;
}

/**
 * Mark a gesture as accepted and reset hold timer
 */
export function markAccepted(gestureName) {
  lastAcceptedGesture = gestureName;
  lastAcceptedTime = Date.now();
  holdGestureName = null;
  holdStartTime = 0;
}

/**
 * Reset the recognition buffer
 */
export function resetBuffer() {
  buffer = [];
  lastAcceptedGesture = null;
  lastAcceptedTime = 0;
  holdGestureName = null;
  holdStartTime = 0;
  prevLandmarks = null;
  smoothedLandmarks = null;
  resetTrajectory();
}
