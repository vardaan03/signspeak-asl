/**
 * Landmark Analyzer — Custom Gesture Detection Beyond Fingerpose
 * (Accuracy-Tuned Version)
 *
 * Uses raw MediaPipe 3D hand landmarks (21 points) to detect gestures
 * that Fingerpose cannot handle:
 * - Palm orientation (facing camera, away, sideways)
 * - Wrist angle and rotation
 * - Inter-finger distances (pinch, spread, crossing)
 * - Hand openness vs closedness
 * - Compound gestures combining multiple features
 * - Angular joint features (rotation/scale invariant)
 * - Finger crossing detection (R)
 * - Precise thumb position analysis (A/S/E/T/M/N)
 * - Wrist angle for orientation-dependent letters (G/H vs D/U)
 *
 * MediaPipe Landmark indices:
 *   0: WRIST
 *   1-4: THUMB (CMC, MCP, IP, TIP)
 *   5-8: INDEX (MCP, PIP, DIP, TIP)
 *   9-12: MIDDLE (MCP, PIP, DIP, TIP)
 *   13-16: RING (MCP, PIP, DIP, TIP)
 *   17-20: PINKY (MCP, PIP, DIP, TIP)
 */

// ==========================================
// Vector Math Utilities
// ==========================================

function vec(a, b) {
  return { x: b.x - a.x, y: b.y - a.y, z: (b.z || 0) - (a.z || 0) };
}

function cross(u, v) {
  return {
    x: u.y * v.z - u.z * v.y,
    y: u.z * v.x - u.x * v.z,
    z: u.x * v.y - u.y * v.x,
  };
}

function dot(u, v) {
  return u.x * v.x + u.y * v.y + u.z * v.z;
}

function magnitude(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function normalize(v) {
  const m = magnitude(v);
  if (m === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / m, y: v.y / m, z: v.z / m };
}

function dist3D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function dist2D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ==========================================
// Palm & Hand Feature Extraction
// ==========================================

function getPalmNormal(landmarks) {
  const wrist = landmarks[0];
  const indexMCP = landmarks[5];
  const pinkyMCP = landmarks[17];
  const v1 = vec(wrist, indexMCP);
  const v2 = vec(wrist, pinkyMCP);
  return normalize(cross(v1, v2));
}

function getPalmFacing(landmarks) {
  const normal = getPalmNormal(landmarks);
  return -normal.z;
}

function getHandOpenness(landmarks) {
  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  const palmSize = dist3D(wrist, middleMCP);
  if (palmSize < 0.001) return 0;
  const tips = [4, 8, 12, 16, 20];
  let totalDist = 0;
  for (const tipIdx of tips) {
    totalDist += dist3D(wrist, landmarks[tipIdx]);
  }
  const avgDist = totalDist / tips.length;
  return Math.min(1, avgDist / (palmSize * 2.5));
}

function getFingerSpread(landmarks) {
  const tips = [8, 12, 16, 20];
  let totalSpread = 0;
  for (let i = 0; i < tips.length - 1; i++) {
    totalSpread += dist2D(landmarks[tips[i]], landmarks[tips[i + 1]]);
  }
  const palmSize = dist2D(landmarks[0], landmarks[9]);
  if (palmSize < 0.001) return 0;
  return Math.min(1, totalSpread / (palmSize * 3));
}

/**
 * Get spread between index and middle finger tips specifically
 * (critical for U vs V vs R discrimination)
 */
function getIndexMiddleSpread(landmarks) {
  const palmSize = dist2D(landmarks[0], landmarks[9]);
  if (palmSize < 0.001) return 0;
  return dist2D(landmarks[8], landmarks[12]) / palmSize;
}

function isThumbTouching(landmarks, fingerTipIdx) {
  const thumbTip = landmarks[4];
  const fingerTip = landmarks[fingerTipIdx];
  const palmSize = dist2D(landmarks[0], landmarks[9]);
  if (palmSize < 0.001) return false;
  const d = dist2D(thumbTip, fingerTip);
  return d / palmSize < 0.35;
}

/**
 * Check if thumb tip is touching a specific finger's PIP or DIP joint
 * (more precise for D, F detection)
 */
function isThumbTouchingJoint(landmarks, jointIdx) {
  const thumbTip = landmarks[4];
  const joint = landmarks[jointIdx];
  const palmSize = dist2D(landmarks[0], landmarks[9]);
  if (palmSize < 0.001) return false;
  return dist2D(thumbTip, joint) / palmSize < 0.3;
}

function getWristAngle(landmarks) {
  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  const dx = middleMCP.x - wrist.x;
  const dy = middleMCP.y - wrist.y;
  return Math.atan2(dx, -dy) * (180 / Math.PI); // 0 = straight up
}

/**
 * Get the angle of the index finger relative to vertical
 * Critical for G (horizontal) vs D (vertical)
 */
function getIndexAngle(landmarks) {
  const indexMCP = landmarks[5];
  const indexTip = landmarks[8];
  const dx = indexTip.x - indexMCP.x;
  const dy = indexTip.y - indexMCP.y;
  return Math.atan2(dx, -dy) * (180 / Math.PI); // 0 = up, 90 = right, -90 = left
}

function isFingerExtended(landmarks, fingerBase, fingerTip) {
  const wrist = landmarks[0];
  const base = landmarks[fingerBase];
  const tip = landmarks[fingerTip];
  const palmLen = dist2D(wrist, base);
  if (palmLen < 0.001) return false;
  return dist2D(wrist, tip) > dist2D(wrist, base) * 0.85;
}

/**
 * Stricter finger extension check using joint angles
 * A finger is "fully extended" if PIP angle > 150 degrees
 */
function isFingerStraight(landmarks, mcp, pip, dip, tip) {
  const pipAngle = jointAngle(landmarks, mcp, pip, dip);
  const dipAngle = jointAngle(landmarks, pip, dip, tip);
  return pipAngle > 140 && dipAngle > 140;
}

/**
 * Check if a finger is curled (PIP angle < 120 degrees)
 */
function isFingerCurled(landmarks, mcp, pip, dip) {
  const pipAngle = jointAngle(landmarks, mcp, pip, dip);
  return pipAngle < 120;
}

function jointAngle(landmarks, a, b, c) {
  const ba = vec(landmarks[b], landmarks[a]);
  const bc = vec(landmarks[b], landmarks[c]);
  const d = dot(ba, bc);
  const magBA = magnitude(ba);
  const magBC = magnitude(bc);
  if (magBA < 0.0001 || magBC < 0.0001) return 0;
  const cosAngle = Math.max(-1, Math.min(1, d / (magBA * magBC)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

function normalizeLandmarks(landmarks) {
  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  const palmSize = dist3D(wrist, middleMCP);
  if (palmSize < 0.001) return landmarks;
  const cx = (wrist.x + middleMCP.x) / 2;
  const cy = (wrist.y + middleMCP.y) / 2;
  const cz = ((wrist.z || 0) + (middleMCP.z || 0)) / 2;
  return landmarks.map(lm => ({
    x: (lm.x - cx) / palmSize,
    y: (lm.y - cy) / palmSize,
    z: ((lm.z || 0) - cz) / palmSize,
  }));
}

/**
 * Detect if index and middle fingers are crossed (for R)
 * Uses 3D analysis: if the middle fingertip crosses over the index finger line
 */
function areFingersCrossed(landmarks) {
  const indexMCP = landmarks[5];
  const indexTip = landmarks[8];
  const middleMCP = landmarks[9];
  const middleTip = landmarks[12];

  // In a normal (uncrossed) hand, middle tip is on the pinky-side of index tip.
  // When crossed, middle tip moves to the thumb-side of index tip.
  // We check the x-offset relative to the hand orientation.

  // Direction from index MCP to middle MCP (the "normal" spacing direction)
  const normalDir = indexMCP.x - middleMCP.x; // positive if index is to the right of middle

  // Direction from index tip to middle tip
  const tipDir = indexTip.x - middleTip.x;

  // If tipDir has OPPOSITE sign from normalDir, fingers are crossed
  // (middle tip has crossed over to the other side of index)
  if (normalDir * tipDir < 0) return true;

  // Also check if tips are very close (touching = crossed attempt)
  const palmSize = dist2D(landmarks[0], landmarks[9]);
  if (palmSize < 0.001) return false;
  const tipDist = dist2D(indexTip, middleTip) / palmSize;
  return tipDist < 0.15;
}

/**
 * Get a full feature vector for the hand pose
 */
export function extractHandFeatures(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const angles = {
    indexPIP: jointAngle(landmarks, 5, 6, 7),
    middlePIP: jointAngle(landmarks, 9, 10, 11),
    ringPIP: jointAngle(landmarks, 13, 14, 15),
    pinkyPIP: jointAngle(landmarks, 17, 18, 19),
    indexMCP: jointAngle(landmarks, 0, 5, 6),
    middleMCP: jointAngle(landmarks, 0, 9, 10),
    thumbCMC: jointAngle(landmarks, 0, 1, 2),
    thumbMCP: jointAngle(landmarks, 1, 2, 3),
    thumbIP: jointAngle(landmarks, 2, 3, 4),
    // DIP joint angles (more precise curl detection)
    indexDIP: jointAngle(landmarks, 6, 7, 8),
    middleDIP: jointAngle(landmarks, 10, 11, 12),
    ringDIP: jointAngle(landmarks, 14, 15, 16),
    pinkyDIP: jointAngle(landmarks, 18, 19, 20),
  };

  return {
    palmFacing: getPalmFacing(landmarks),
    handOpenness: getHandOpenness(landmarks),
    fingerSpread: getFingerSpread(landmarks),
    indexMiddleSpread: getIndexMiddleSpread(landmarks),
    wristAngle: getWristAngle(landmarks),
    indexAngle: getIndexAngle(landmarks),

    // Finger extension states
    thumbExtended: isFingerExtended(landmarks, 2, 4),
    indexExtended: isFingerExtended(landmarks, 5, 8),
    middleExtended: isFingerExtended(landmarks, 9, 12),
    ringExtended: isFingerExtended(landmarks, 13, 16),
    pinkyExtended: isFingerExtended(landmarks, 17, 20),

    // Stricter extension (uses joint angles)
    indexStraight: isFingerStraight(landmarks, 5, 6, 7, 8),
    middleStraight: isFingerStraight(landmarks, 9, 10, 11, 12),

    // Finger curl states (joint-angle based)
    indexCurled: isFingerCurled(landmarks, 5, 6, 7),
    middleCurled: isFingerCurled(landmarks, 9, 10, 11),
    ringCurled: isFingerCurled(landmarks, 13, 14, 15),
    pinkyCurled: isFingerCurled(landmarks, 17, 18, 19),

    // Finger crossing (R detection)
    fingersCrossed: areFingersCrossed(landmarks),

    // Finger touching states
    thumbTouchesIndex: isThumbTouching(landmarks, 8),
    thumbTouchesMiddle: isThumbTouching(landmarks, 12),
    thumbTouchesRing: isThumbTouching(landmarks, 16),
    thumbTouchesPinky: isThumbTouching(landmarks, 20),

    // Precise thumb-to-joint touching (for D, F)
    thumbTouchesIndexPIP: isThumbTouchingJoint(landmarks, 6),
    thumbTouchesMiddlePIP: isThumbTouchingJoint(landmarks, 10),
    thumbTouchesMiddleDIP: isThumbTouchingJoint(landmarks, 11),

    // Angular features (rotation/scale invariant)
    angles,

    // Raw positions for advanced detection
    wrist: landmarks[0],
    thumbTip: landmarks[4],
    thumbIP: landmarks[3],
    indexMCP: landmarks[5],
    indexTip: landmarks[8],
    middleMCP: landmarks[9],
    middleTip: landmarks[12],
    ringTip: landmarks[16],
    pinkyTip: landmarks[20],
    indexPIP: landmarks[6],
    middlePIP: landmarks[10],
    indexDIP: landmarks[7],
    middleDIP: landmarks[11],
  };
}

// ==========================================
// Disambiguation Rules for Confusing Letter Pairs
// ==========================================

function getThumbPosition(landmarks) {
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const indexMCP = landmarks[5];
  const middleMCP = landmarks[9];
  const wrist = landmarks[0];
  const palmSize = dist2D(wrist, landmarks[9]);

  return {
    thumbTip,
    thumbIP,
    thumbToIndexSide: dist2D(thumbTip, indexMCP) / (palmSize || 0.001),
    thumbAboveFingers: (indexMCP.y - thumbTip.y) / (palmSize || 0.001),
    thumbBetweenFingers: dist2D(thumbTip, {
      x: (indexMCP.x + middleMCP.x) / 2,
      y: (indexMCP.y + middleMCP.y) / 2,
    }) / (palmSize || 0.001),
  };
}

function getFingerTipDistance(landmarks, tipA, tipB) {
  const palmSize = dist2D(landmarks[0], landmarks[9]);
  if (palmSize < 0.001) return 0;
  return dist2D(landmarks[tipA], landmarks[tipB]) / palmSize;
}

/**
 * Disambiguate confusing Fingerpose results using landmark analysis.
 * Returns { name, scoreAdjust } or null.
 *
 * Covers ALL known confusing pairs:
 * - A/S/E/T (fist variants)
 * - M/N (fist with fingers over thumb)
 * - U/R (two fingers up: parallel vs crossed)
 * - V/K (two fingers up: spread vs thumb between)
 * - B/Hello (flat hand: thumb tucked vs out)
 * - D/I (single finger: index vs pinky)
 * - D/G (index up vs index horizontal)
 * - G/Q (horizontal vs pointing down)
 * - H/P (two horizontal vs two pointing down)
 * - H/U/V (two fingers: horizontal vs vertical)
 * - F/OK (thumb-index circle)
 * - I/Y (pinky up: thumb curled vs extended)
 * - L/Y (thumb+finger out)
 * - C/O (curved: open C vs closed O)
 * - D/Pointing (index up with vs without thumb-middle touch)
 * - W/B (3 fingers vs 4 fingers up)
 */
export function disambiguate(gestureName, landmarks, features) {
  if (!landmarks || !features) return null;

  const thumbPos = getThumbPosition(landmarks);
  const palmSize = dist2D(landmarks[0], landmarks[9]);

  // --- A vs S vs E vs T ---
  if (['A', 'S', 'E', 'T'].includes(gestureName)) {
    const thumbTip = landmarks[4];
    const indexPIP = landmarks[6];
    const indexDIP = landmarks[7];
    const middlePIP = landmarks[10];
    const indexTip = landmarks[8];

    const thumbToIndexPIP = dist2D(thumbTip, indexPIP) / (palmSize || 0.001);
    const thumbToMiddlePIP = dist2D(thumbTip, middlePIP) / (palmSize || 0.001);
    const thumbToIndexDIP = dist2D(thumbTip, indexDIP) / (palmSize || 0.001);

    // T: thumb tucked between index and middle (very close to both PIPs)
    const isTuckedBetween = thumbToIndexPIP < 0.4 && thumbToMiddlePIP < 0.4;
    if (isTuckedBetween) {
      return { name: 'T', scoreAdjust: 2.0 };
    }

    // E: all fingers curled, thumb tip is BELOW/under the curled finger tips
    // Thumb crosses below the curled fingers
    const thumbBelowFingers = thumbTip.y > indexTip.y + 0.01;
    const allFingersCurled = features.indexCurled && features.middleCurled &&
                             features.ringCurled && features.pinkyCurled;
    if (allFingersCurled && thumbBelowFingers && thumbPos.thumbAboveFingers < -0.02) {
      return { name: 'E', scoreAdjust: 1.5 };
    }

    // A: thumb alongside fist pointing UP, not crossing over
    if (thumbPos.thumbAboveFingers > 0.15 && thumbPos.thumbToIndexSide < 0.55) {
      return { name: 'A', scoreAdjust: 1.5 };
    }

    // S: thumb over curled fingers (in front of them, close to index DIP)
    if (thumbToIndexDIP < 0.4 && !isTuckedBetween && thumbPos.thumbAboveFingers >= -0.02) {
      return { name: 'S', scoreAdjust: 1.0 };
    }
  }

  // --- U vs R ---
  // Both have index and middle up. U = parallel, R = crossed
  if (['U', 'R'].includes(gestureName)) {
    // Use both distance and crossing detection
    if (features.fingersCrossed) {
      return { name: 'R', scoreAdjust: 2.0 };
    }
    const indexMiddleDist = getFingerTipDistance(landmarks, 8, 12);
    if (indexMiddleDist < 0.18) {
      // Very close tips — likely crossed or attempting R
      return { name: 'R', scoreAdjust: 1.5 };
    }
    if (indexMiddleDist >= 0.18 && indexMiddleDist < 0.4) {
      // Parallel fingers — U
      return { name: 'U', scoreAdjust: 1.5 };
    }
    if (indexMiddleDist >= 0.4) {
      // Spread apart — this is actually V not U
      return { name: 'U', scoreAdjust: 0.3 }; // Low score, let V win
    }
  }

  // --- V vs K ---
  if (['V', 'K'].includes(gestureName)) {
    const thumbTip = landmarks[4];
    const thumbToMiddlePIP = dist2D(thumbTip, landmarks[10]) / (palmSize || 0.001);
    const thumbBetween = thumbPos.thumbBetweenFingers;

    // K: thumb tip is between index and middle, touching middle
    if (thumbToMiddlePIP < 0.35 && thumbBetween < 0.45 && features.thumbExtended) {
      return { name: 'K', scoreAdjust: 2.0 };
    }

    // V: thumb curled, fingers spread
    if (!features.thumbExtended && features.indexMiddleSpread > 0.25) {
      return { name: 'V', scoreAdjust: 1.0 };
    }

    // Default: if fingers are spread it's V, if thumb is between it's K
    if (features.indexMiddleSpread > 0.3) {
      return { name: 'V', scoreAdjust: 0.5 };
    }
  }

  // --- B vs Hello (open palm) ---
  if (gestureName === 'B') {
    if (features.thumbExtended && features.fingerSpread > 0.22) {
      return { name: '🖐 Hello', scoreAdjust: 1.5 };
    }
  }

  // --- D vs I (index up vs pinky up) ---
  if (['D', 'I'].includes(gestureName)) {
    if (features.pinkyExtended && !features.indexExtended) {
      return { name: 'I', scoreAdjust: 2.0 };
    }
    if (features.indexExtended && !features.pinkyExtended) {
      return { name: 'D', scoreAdjust: 2.0 };
    }
  }

  // --- D vs G (index vertical vs index horizontal) ---
  if (['D', 'G'].includes(gestureName)) {
    const absAngle = Math.abs(features.indexAngle);
    // G: index is roughly horizontal (angle > 50 from vertical)
    if (absAngle > 50) {
      return { name: 'G', scoreAdjust: 1.5 };
    }
    // D: index is roughly vertical (angle < 35 from vertical)
    if (absAngle < 35) {
      return { name: 'D', scoreAdjust: 1.5 };
    }
  }

  // --- G vs Q (horizontal index vs downward index) ---
  if (['G', 'Q'].includes(gestureName)) {
    const indexTip = landmarks[8];
    const indexMCP = landmarks[5];
    // Q: index tip is BELOW index MCP (pointing down)
    if (indexTip.y > indexMCP.y + 0.02) {
      return { name: 'Q', scoreAdjust: 1.5 };
    }
    // G: index tip is roughly at same height or above MCP (horizontal)
    if (indexTip.y <= indexMCP.y + 0.02) {
      return { name: 'G', scoreAdjust: 1.5 };
    }
  }

  // --- H vs P (two fingers horizontal vs two fingers pointing down) ---
  if (['H', 'P'].includes(gestureName)) {
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const indexMCP = landmarks[5];
    const middleMCP = landmarks[9];
    const avgTipY = (indexTip.y + middleTip.y) / 2;
    const avgMCPY = (indexMCP.y + middleMCP.y) / 2;
    // P: fingertips are below MCPs (pointing down)
    if (avgTipY > avgMCPY + 0.03) {
      return { name: 'P', scoreAdjust: 1.5 };
    }
    // H: fingertips are roughly at same height as MCPs (horizontal)
    if (avgTipY <= avgMCPY + 0.03) {
      return { name: 'H', scoreAdjust: 1.5 };
    }
  }

  // --- H vs U/V (two fingers horizontal vs vertical) ---
  if (gestureName === 'H') {
    const absAngle = Math.abs(features.indexAngle);
    // If index is roughly vertical, this is U or V, not H
    if (absAngle < 30) {
      if (features.indexMiddleSpread > 0.35) {
        return { name: 'V', scoreAdjust: 1.0 };
      }
      return { name: 'U', scoreAdjust: 1.0 };
    }
  }

  // --- M vs N ---
  if (['M', 'N'].includes(gestureName)) {
    const ringTip = landmarks[16];
    const thumbTip = landmarks[4];
    const ringOverThumb = dist2D(ringTip, thumbTip) / (palmSize || 0.001);
    // M: ring finger is also draped over thumb (close to it)
    if (ringOverThumb < 0.4) {
      return { name: 'M', scoreAdjust: 1.5 };
    }
    // N: only index and middle over thumb, ring is curled away
    return { name: 'N', scoreAdjust: 1.5 };
  }

  // --- I vs Y (pinky up: I has thumb curled, Y has thumb extended) ---
  if (['I', 'Y'].includes(gestureName)) {
    if (features.thumbExtended && features.pinkyExtended) {
      return { name: 'Y', scoreAdjust: 2.0 };
    }
    if (!features.thumbExtended && features.pinkyExtended) {
      return { name: 'I', scoreAdjust: 2.0 };
    }
  }

  // --- L vs Y ---
  // Both have thumb out. L = index up, Y = pinky up
  if (['L', 'Y'].includes(gestureName)) {
    if (features.indexExtended && !features.pinkyExtended) {
      return { name: 'L', scoreAdjust: 1.5 };
    }
    if (features.pinkyExtended && !features.indexExtended) {
      return { name: 'Y', scoreAdjust: 1.5 };
    }
  }

  // --- C vs O ---
  // C is more open, O is tighter with fingertips closer to thumb
  if (['C', 'O'].includes(gestureName)) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const thumbToIndex = dist2D(thumbTip, indexTip) / (palmSize || 0.001);
    // O: thumb and index tips are very close (forming closed circle)
    if (thumbToIndex < 0.35) {
      return { name: 'O', scoreAdjust: 1.5 };
    }
    // C: thumb and index are spread apart (open curve)
    if (thumbToIndex >= 0.35) {
      return { name: 'C', scoreAdjust: 1.5 };
    }
  }

  // --- F vs D (both have index curled/touching, 3 fingers up) ---
  if (['F', 'D'].includes(gestureName)) {
    // F: middle, ring, pinky are UP; index is curled touching thumb
    // D: only index is UP; middle, ring, pinky are curled
    if (features.middleExtended && features.ringExtended && features.pinkyExtended) {
      return { name: 'F', scoreAdjust: 1.5 };
    }
    if (features.indexExtended && !features.middleExtended) {
      return { name: 'D', scoreAdjust: 1.5 };
    }
  }

  // --- W vs B (3 fingers vs 4 fingers up) ---
  if (['W', 'B'].includes(gestureName)) {
    if (features.pinkyExtended && features.indexExtended &&
        features.middleExtended && features.ringExtended) {
      return { name: 'B', scoreAdjust: 1.0 };
    }
    if (!features.pinkyExtended && features.indexExtended &&
        features.middleExtended && features.ringExtended) {
      return { name: 'W', scoreAdjust: 1.5 };
    }
  }

  // --- D vs ☝ You (Pointing) ---
  // D: index up with thumb touching middle finger
  // Pointing: just index up, thumb curled to side
  if (gestureName === 'D' || gestureName === '☝ You') {
    if (features.thumbTouchesMiddle || features.thumbTouchesMiddlePIP || features.thumbTouchesMiddleDIP) {
      return { name: 'D', scoreAdjust: 1.0 };
    }
    // Just index pointing with no thumb-middle contact = Pointing
    if (features.indexExtended && !features.middleExtended && !features.thumbTouchesMiddle) {
      return { name: '☝ You', scoreAdjust: 0.5 };
    }
  }

  return null;
}

// ==========================================
// Custom Gesture Definitions (beyond Fingerpose)
// ==========================================

const customGestures = [
  {
    name: 'Thank You',
    test(features, face) {
      const isOpenHand = features.handOpenness > 0.55 &&
          features.fingerSpread < 0.4 &&
          features.indexExtended && features.middleExtended &&
          features.ringExtended && features.pinkyExtended;

      if (!isOpenHand) return null;

      if (face && face.chin) {
        const handCenter = features.wrist;
        const chinDist = dist2D(handCenter, face.chin);
        if (chinDist < 0.25) {
          return 9.5;
        }
      }

      if (features.palmFacing > 0.2) {
        return 7.5;
      }
      return null;
    },
  },
  {
    name: 'Please',
    test(features, face) {
      if (features.handOpenness < 0.5 || features.thumbTouchesIndex) return null;
      if (features.fingerSpread > 0.35) return null;

      if (face && face.chin) {
        const handCenter = features.wrist;
        const isBelowChin = handCenter.y > face.chin.y + 0.05;
        if (isBelowChin && features.palmFacing < 0) {
          return 9.0;
        }
      }

      if (features.palmFacing < -0.1) {
        return 7.0;
      }
      return null;
    },
  },
  {
    name: 'Think',
    test(features, face) {
      if (!face || !face.forehead) return null;
      if (!features.indexExtended) return null;
      if (features.middleExtended || features.ringExtended || features.pinkyExtended) return null;

      const indexTipDist = dist2D(features.indexTip, face.forehead);
      if (indexTipDist < 0.12) {
        return 9.0;
      }
      return null;
    },
  },
  {
    name: 'Eat',
    test(features, face) {
      if (!face || !face.upperLip) return null;
      if (features.fingerSpread > 0.3) return null;
      const mouthDist = dist2D(features.indexTip, face.upperLip);
      if (mouthDist < 0.12 && features.handOpenness < 0.6) {
        return 9.0;
      }
      return null;
    },
  },
  {
    name: 'OK',
    test(features) {
      if (features.thumbTouchesIndex &&
          features.middleExtended &&
          features.ringExtended &&
          features.pinkyExtended &&
          !features.indexExtended) {
        return 9.0;
      }
      return null;
    },
  },
  {
    name: 'Peace',
    test(features) {
      if (features.indexExtended &&
          features.middleExtended &&
          !features.ringExtended &&
          !features.pinkyExtended &&
          features.indexMiddleSpread > 0.3) {
        return 8.5;
      }
      return null;
    },
  },
  {
    name: 'Call Me',
    test(features) {
      if (features.thumbExtended &&
          features.pinkyExtended &&
          !features.indexExtended &&
          !features.middleExtended &&
          !features.ringExtended) {
        const thumbPinkyDist = dist2D(features.thumbTip, features.pinkyTip);
        const palmSize = dist2D(features.wrist, features.indexTip);
        if (palmSize > 0.001 && thumbPinkyDist / palmSize > 0.8) {
          return 8.5;
        }
      }
      return null;
    },
  },
  {
    name: 'Rock On',
    test(features) {
      if (features.indexExtended &&
          features.pinkyExtended &&
          !features.middleExtended &&
          !features.ringExtended) {
        return 8.5;
      }
      return null;
    },
  },
  {
    name: 'Good',
    test(features) {
      if (features.thumbExtended &&
          !features.indexExtended &&
          !features.middleExtended &&
          !features.ringExtended &&
          !features.pinkyExtended) {
        if (features.thumbTip.y < features.wrist.y) {
          return 8.5;
        }
      }
      return null;
    },
  },
];

export function analyzeCustomGestures(landmarks, face) {
  const features = extractHandFeatures(landmarks);
  if (!features) return [];

  const results = [];
  for (const gesture of customGestures) {
    const score = gesture.test(features, face || null);
    if (score !== null && score > 0) {
      results.push({ name: gesture.name, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

export function getCustomGestureNames() {
  return customGestures.map((g) => g.name);
}

export const customSignsReference = [
  { letter: '🙏', name: 'Thank You', desc: 'Flat hand from chin forward', motion: true, bodyRelative: true },
  { letter: '🥺', name: 'Please', desc: 'Flat hand on chest', motion: false, bodyRelative: true },
  { letter: '🤔', name: 'Think', desc: 'Index finger to temple', motion: false, bodyRelative: true },
  { letter: '🍕', name: 'Eat', desc: 'Fingers bunched to mouth', motion: false, bodyRelative: true },
  { letter: '👌', name: 'OK', desc: 'Thumb & index circle, other fingers up', motion: false, bodyRelative: false },
  { letter: '✌️', name: 'Peace', desc: 'Index & middle up, spread apart', motion: false, bodyRelative: false },
  { letter: '🤙', name: 'Call Me', desc: 'Thumb & pinky out, others curled', motion: false, bodyRelative: false },
  { letter: '🤘', name: 'Rock On', desc: 'Index & pinky up, middle & ring curled', motion: false, bodyRelative: false },
  { letter: '👍', name: 'Good', desc: 'Thumbs up', motion: false, bodyRelative: false },
];
