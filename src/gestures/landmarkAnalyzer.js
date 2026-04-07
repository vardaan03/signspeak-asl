/**
 * Landmark Analyzer — Custom Gesture Detection Beyond Fingerpose
 * 
 * Uses raw MediaPipe 3D hand landmarks (21 points) to detect gestures
 * that Fingerpose cannot handle:
 * - Palm orientation (facing camera, away, sideways)
 * - Wrist angle and rotation
 * - Inter-finger distances (pinch, spread)
 * - Hand openness vs closedness
 * - Compound gestures combining multiple features
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

/**
 * Get palm normal vector (indicates which way the palm is facing)
 * Uses wrist(0), index_mcp(5), pinky_mcp(17)
 */
function getPalmNormal(landmarks) {
  const wrist = landmarks[0];
  const indexMCP = landmarks[5];
  const pinkyMCP = landmarks[17];

  const v1 = vec(wrist, indexMCP);
  const v2 = vec(wrist, pinkyMCP);
  return normalize(cross(v1, v2));
}

/**
 * Check if palm is facing the camera (z-component of normal)
 * Returns value from -1 (facing away) to 1 (facing camera)
 */
function getPalmFacing(landmarks) {
  const normal = getPalmNormal(landmarks);
  // Positive z means facing camera (MediaPipe z increases toward camera)
  return -normal.z; // Negate because MediaPipe z is negative toward camera
}

/**
 * Get overall hand openness (0 = fully closed fist, 1 = fully open)
 * Measures average fingertip distance from wrist relative to palm size
 */
function getHandOpenness(landmarks) {
  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  const palmSize = dist3D(wrist, middleMCP);

  if (palmSize < 0.001) return 0;

  const tips = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky tips
  let totalDist = 0;
  for (const tipIdx of tips) {
    totalDist += dist3D(wrist, landmarks[tipIdx]);
  }
  const avgDist = totalDist / tips.length;
  // Normalize by palm size; fully open hand typically has ratio ~2.5
  return Math.min(1, avgDist / (palmSize * 2.5));
}

/**
 * Get finger spread (how far apart the fingers are from each other)
 * 0 = all together, 1 = maximum spread
 */
function getFingerSpread(landmarks) {
  const tips = [8, 12, 16, 20]; // index through pinky tips
  let totalSpread = 0;
  for (let i = 0; i < tips.length - 1; i++) {
    totalSpread += dist2D(landmarks[tips[i]], landmarks[tips[i + 1]]);
  }
  const palmSize = dist2D(landmarks[0], landmarks[9]);
  if (palmSize < 0.001) return 0;
  return Math.min(1, totalSpread / (palmSize * 3));
}

/**
 * Check if thumb is touching or very close to a specific fingertip
 */
function isThumbTouching(landmarks, fingerTipIdx) {
  const thumbTip = landmarks[4];
  const fingerTip = landmarks[fingerTipIdx];
  const palmSize = dist2D(landmarks[0], landmarks[9]);
  if (palmSize < 0.001) return false;
  const d = dist2D(thumbTip, fingerTip);
  return d / palmSize < 0.35;
}

/**
 * Get wrist angle (how much the hand is rotated/tilted)
 * Returns angle in degrees from vertical
 */
function getWristAngle(landmarks) {
  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  const dx = middleMCP.x - wrist.x;
  const dy = middleMCP.y - wrist.y;
  return Math.atan2(dx, -dy) * (180 / Math.PI); // 0 = straight up
}

/**
 * Check if a finger is extended (not curled)
 */
function isFingerExtended(landmarks, fingerBase, fingerTip) {
  const wrist = landmarks[0];
  const base = landmarks[fingerBase];
  const tip = landmarks[fingerTip];
  const palmLen = dist2D(wrist, base);
  if (palmLen < 0.001) return false;
  // Extended if tip is further from wrist than base
  return dist2D(wrist, tip) > dist2D(wrist, base) * 0.85;
}

/**
 * Compute the angle at a joint formed by three landmarks (in degrees).
 * Used for angular feature extraction — rotation/scale invariant.
 * (Google research shows 25% accuracy gain over raw coordinates)
 */
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

/**
 * Normalize landmarks relative to palm center and palm size.
 * Makes features invariant to camera distance and position.
 * (Google MediaPipe recommended normalization)
 */
function normalizeLandmarks(landmarks) {
  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  const palmSize = dist3D(wrist, middleMCP);
  if (palmSize < 0.001) return landmarks;

  // Palm center = midpoint of wrist and middle MCP
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
 * Get a full feature vector for the hand pose
 */
export function extractHandFeatures(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  // Compute angular features for key joints (rotation/scale invariant)
  const angles = {
    // PIP joint angles (measures curl)
    indexPIP: jointAngle(landmarks, 5, 6, 7),
    middlePIP: jointAngle(landmarks, 9, 10, 11),
    ringPIP: jointAngle(landmarks, 13, 14, 15),
    pinkyPIP: jointAngle(landmarks, 17, 18, 19),
    // MCP joint angles (measures extension)
    indexMCP: jointAngle(landmarks, 0, 5, 6),
    middleMCP: jointAngle(landmarks, 0, 9, 10),
    // Thumb angles
    thumbCMC: jointAngle(landmarks, 0, 1, 2),
    thumbMCP: jointAngle(landmarks, 1, 2, 3),
    thumbIP: jointAngle(landmarks, 2, 3, 4),
  };

  return {
    palmFacing: getPalmFacing(landmarks),
    handOpenness: getHandOpenness(landmarks),
    fingerSpread: getFingerSpread(landmarks),
    wristAngle: getWristAngle(landmarks),

    // Finger extension states
    thumbExtended: isFingerExtended(landmarks, 2, 4),
    indexExtended: isFingerExtended(landmarks, 5, 8),
    middleExtended: isFingerExtended(landmarks, 9, 12),
    ringExtended: isFingerExtended(landmarks, 13, 16),
    pinkyExtended: isFingerExtended(landmarks, 17, 20),

    // Finger touching states
    thumbTouchesIndex: isThumbTouching(landmarks, 8),
    thumbTouchesMiddle: isThumbTouching(landmarks, 12),
    thumbTouchesRing: isThumbTouching(landmarks, 16),
    thumbTouchesPinky: isThumbTouching(landmarks, 20),

    // Angular features (rotation/scale invariant — Google research)
    angles,

    // Raw positions for advanced detection
    wrist: landmarks[0],
    thumbTip: landmarks[4],
    indexTip: landmarks[8],
    middleTip: landmarks[12],
    ringTip: landmarks[16],
    pinkyTip: landmarks[20],
  };
}

// ==========================================
// Disambiguation Rules for Confusing Letter Pairs
// ==========================================

/**
 * Post-process Fingerpose results to disambiguate similar hand shapes.
 * Each rule takes the top gesture name, raw landmarks, and features,
 * and returns a corrected name + adjusted score, or null to keep original.
 */

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
    // How far thumb tip is from index MCP (side of fist)
    thumbToIndexSide: dist2D(thumbTip, indexMCP) / (palmSize || 0.001),
    // How far thumb tip is above fingers (over fist)
    thumbAboveFingers: (indexMCP.y - thumbTip.y) / (palmSize || 0.001),
    // Thumb tip relative to index/middle MCP midpoint
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
 */
export function disambiguate(gestureName, landmarks, features) {
  if (!landmarks || !features) return null;

  const thumbPos = getThumbPosition(landmarks);
  const palmSize = dist2D(landmarks[0], landmarks[9]);

  // --- A vs S vs E vs T ---
  // All are closed fists with different thumb positions
  if (['A', 'S', 'E', 'T'].includes(gestureName)) {
    // A: thumb alongside fist (thumb tip beside index MCP, not over or tucked)
    // S: thumb over curled fingers (thumb tip in front of/over fingers)
    // T: thumb tucked between index and middle (thumb tip between them)
    // E: all curled, thumb across (thumb tip touching or very close to fingers)

    const thumbTip = landmarks[4];
    const indexPIP = landmarks[6];
    const indexDIP = landmarks[7];
    const middlePIP = landmarks[10];

    // Check if thumb is tucked between index and middle
    const thumbToIndexPIP = dist2D(thumbTip, indexPIP) / (palmSize || 0.001);
    const thumbToMiddlePIP = dist2D(thumbTip, middlePIP) / (palmSize || 0.001);
    const isTuckedBetween = thumbToIndexPIP < 0.45 && thumbToMiddlePIP < 0.45;

    if (isTuckedBetween) {
      return { name: 'T', scoreAdjust: 1.5 };
    }

    // A: thumb is to the side and slightly up
    if (thumbPos.thumbToIndexSide < 0.5 && thumbPos.thumbAboveFingers > 0.1) {
      return { name: 'A', scoreAdjust: 1.0 };
    }

    // S: thumb is over the curled fingers (in front of them)
    const thumbOverFingers = dist2D(thumbTip, indexDIP) / (palmSize || 0.001);
    if (thumbOverFingers < 0.4 && !isTuckedBetween) {
      return { name: 'S', scoreAdjust: 1.0 };
    }

    // E: thumb crosses underneath the fingers
    if (thumbPos.thumbAboveFingers < -0.05) {
      return { name: 'E', scoreAdjust: 1.0 };
    }
  }

  // --- U vs R ---
  // Both have index and middle up. U = parallel, R = crossed
  if (['U', 'R'].includes(gestureName)) {
    const indexMiddleDist = getFingerTipDistance(landmarks, 8, 12);
    // R: fingers crossed/touching (tips very close)
    // U: fingers parallel (tips separated)
    if (indexMiddleDist < 0.25) {
      return { name: 'R', scoreAdjust: 1.5 };
    } else {
      return { name: 'U', scoreAdjust: 1.0 };
    }
  }

  // --- V vs K ---
  // Both have index and middle up. V = thumb curled, K = thumb between fingers
  if (['V', 'K'].includes(gestureName)) {
    const thumbTip = landmarks[4];
    const indexMCP = landmarks[5];
    const middleMCP = landmarks[9];
    // K: thumb tip is between index and middle, touching middle finger
    const thumbToMiddle = dist2D(thumbTip, landmarks[10]) / (palmSize || 0.001);
    const thumbBetween = thumbPos.thumbBetweenFingers;
    if (thumbToMiddle < 0.4 && thumbBetween < 0.5 && features.thumbExtended) {
      return { name: 'K', scoreAdjust: 1.5 };
    } else {
      return { name: 'V', scoreAdjust: 0.5 };
    }
  }

  // --- B vs Hello (open palm) ---
  // B = flat hand with thumb tucked, Hello = open hand with thumb out
  if (gestureName === 'B') {
    if (features.thumbExtended && features.fingerSpread > 0.25) {
      return { name: '🖐 Hello', scoreAdjust: 1.0 }; // Matches commonSigns name
    }
  }

  // --- D vs I (index up vs pinky up) ---
  if (['D', 'I'].includes(gestureName)) {
    if (features.pinkyExtended && !features.indexExtended) {
      return { name: 'I', scoreAdjust: 1.5 };
    }
    if (features.indexExtended && !features.pinkyExtended) {
      return { name: 'D', scoreAdjust: 1.5 };
    }
  }

  // --- M vs N ---
  // Both fists pointing down. M = 3 fingers over thumb, N = 2 fingers over thumb
  if (['M', 'N'].includes(gestureName)) {
    // Check ring finger position - M has ring over thumb, N does not
    const ringTip = landmarks[16];
    const thumbTip = landmarks[4];
    const ringOverThumb = dist2D(ringTip, thumbTip) / (palmSize || 0.001);
    if (ringOverThumb < 0.45) {
      return { name: 'M', scoreAdjust: 1.0 };
    } else {
      return { name: 'N', scoreAdjust: 1.0 };
    }
  }

  return null;
}

// ==========================================
// Custom Gesture Definitions (beyond Fingerpose)
// ==========================================

/**
 * Each custom gesture has:
 * - name: display name
 * - test: function(features) => confidence (0-10) or null
 */
const customGestures = [
  {
    // THANK YOU: Flat hand touches chin then moves forward
    // With face detection: hand near chin, open, palm out
    // Without face: open hand, palm facing out, fingers together (fallback)
    name: 'Thank You',
    test(features, face) {
      const isOpenHand = features.handOpenness > 0.55 &&
          features.fingerSpread < 0.4 &&
          features.indexExtended && features.middleExtended &&
          features.ringExtended && features.pinkyExtended;

      if (!isOpenHand) return null;

      // With face data: check hand is near chin
      if (face && face.chin) {
        const handCenter = features.wrist;
        const chinDist = dist2D(handCenter, face.chin);
        // Hand near chin area (within ~30% of frame height)
        if (chinDist < 0.25) {
          return 9.5; // High confidence with body-relative
        }
      }

      // Fallback: open hand, palm out, fingers together
      if (features.palmFacing > 0.2) {
        return 8.0;
      }
      return null;
    },
  },
  {
    // PLEASE: Flat hand on chest circling
    // With face: hand below chin, palm toward body
    name: 'Please',
    test(features, face) {
      if (features.handOpenness < 0.5 || features.thumbTouchesIndex) return null;
      if (features.fingerSpread > 0.35) return null;

      if (face && face.chin) {
        const handCenter = features.wrist;
        // Hand should be below chin (chest area) and palm facing body
        const isBelowChin = handCenter.y > face.chin.y + 0.05;
        if (isBelowChin && features.palmFacing < 0) {
          return 9.0;
        }
      }

      // Fallback
      if (features.palmFacing < -0.1) {
        return 7.5;
      }
      return null;
    },
  },
  {
    // THINK: Index finger pointing to temple
    // Requires face detection
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
    // EAT: Fingers bunched to mouth
    name: 'Eat',
    test(features, face) {
      if (!face || !face.upperLip) return null;

      // All fingertips bunched together (low spread) near mouth
      if (features.fingerSpread > 0.3) return null;
      const mouthDist = dist2D(features.indexTip, face.upperLip);
      if (mouthDist < 0.12 && features.handOpenness < 0.6) {
        return 9.0;
      }
      return null;
    },
  },
  {
    // OK / FINE: Thumb and index form circle, other fingers up
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
    // PEACE / VICTORY: Index and middle up, spread apart
    name: 'Peace',
    test(features) {
      if (features.indexExtended &&
          features.middleExtended &&
          !features.ringExtended &&
          !features.pinkyExtended &&
          features.fingerSpread > 0.3) {
        return 8.5;
      }
      return null;
    },
  },
  {
    // CALL ME: Thumb and pinky out (phone gesture)
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
    // ROCK ON: Index and pinky up, middle and ring curled
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
    // GOOD/LIKE: Thumbs up
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

/**
 * Run all custom gesture detectors
 * @param {Array} landmarks - 21 MediaPipe hand landmarks
 * @param {Object|null} face - Face landmark data (chin, forehead, etc.)
 * @returns {Array<{name: string, score: number}>} Sorted by confidence
 */
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

/**
 * Get all available custom gesture names (for the guide)
 */
export function getCustomGestureNames() {
  return customGestures.map((g) => g.name);
}

// Reference data for the side menu (custom gestures beyond fingerpose)
export const customSignsReference = [
  { letter: 'TY', name: 'Thank You', desc: 'Flat hand from chin forward', motion: true, bodyRelative: true },
  { letter: 'PL', name: 'Please', desc: 'Flat hand on chest', motion: false, bodyRelative: true },
  { letter: 'TH', name: 'Think', desc: 'Index finger to temple', motion: false, bodyRelative: true },
  { letter: 'EA', name: 'Eat', desc: 'Fingers bunched to mouth', motion: false, bodyRelative: true },
  { letter: 'OK', name: 'OK', desc: 'Thumb & index circle, other fingers up', motion: false, bodyRelative: false },
  { letter: 'PC', name: 'Peace', desc: 'Index & middle up, spread apart', motion: false, bodyRelative: false },
  { letter: 'CL', name: 'Call Me', desc: 'Thumb & pinky out, others curled', motion: false, bodyRelative: false },
  { letter: 'RK', name: 'Rock On', desc: 'Index & pinky up, middle & ring curled', motion: false, bodyRelative: false },
  { letter: 'GD', name: 'Good', desc: 'Thumbs up', motion: false, bodyRelative: false },
];
