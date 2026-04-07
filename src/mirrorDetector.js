/**
 * Auto Mirror Detection Module
 * 
 * Detects whether the webcam feed is mirrored by analysing the relationship
 * between MediaPipe's reported handedness and the hand's x-position in frame.
 *
 * Logic:
 * - Most webcams mirror the feed by default (selfie mode).
 * - If MediaPipe reports "Right" hand but the hand appears on the LEFT side
 *   of the frame → the feed is mirrored (expected for front-facing cameras).
 * - If MediaPipe reports "Right" hand and it appears on the RIGHT side
 *   of the frame → the feed is NOT mirrored (external camera / unmirror).
 *
 * We collect several samples before deciding, to avoid false positives.
 */

const REQUIRED_SAMPLES = 8;
const CENTER_DEADZONE = 0.15; // Ignore hands near center (ambiguous)

let samples = [];
let detectedMirrored = null;
let locked = false;

/**
 * Feed a detection sample into the mirror detector
 * @param {Object} handedness - { categoryName: 'Left'|'Right', score: number }
 * @param {Array} landmarks - MediaPipe normalised landmarks
 * @returns {{ decided: boolean, mirrored: boolean|null }}
 */
export function feedMirrorSample(handedness, landmarks) {
  if (locked) {
    return { decided: true, mirrored: detectedMirrored };
  }

  if (!handedness || !landmarks || landmarks.length === 0) {
    return { decided: false, mirrored: null };
  }

  // Calculate the hand center x-position (average of all landmarks)
  const avgX = landmarks.reduce((sum, lm) => sum + lm.x, 0) / landmarks.length;

  // Skip if the hand is near the center — too ambiguous
  if (Math.abs(avgX - 0.5) < CENTER_DEADZONE) {
    return { decided: false, mirrored: null };
  }

  const handIsOnLeft = avgX < 0.5;
  const reportedRight = handedness.categoryName === 'Right';
  const reportedLeft = handedness.categoryName === 'Left';

  // Determine if this sample indicates mirroring
  // In a mirrored feed: right hand appears on left side, left hand appears on right side
  let isMirrored;
  if (reportedRight) {
    isMirrored = handIsOnLeft;  // Right hand on left side = mirrored
  } else if (reportedLeft) {
    isMirrored = !handIsOnLeft; // Left hand on right side = mirrored
  } else {
    return { decided: false, mirrored: null };
  }

  samples.push(isMirrored);

  if (samples.length >= REQUIRED_SAMPLES) {
    // Majority vote
    const mirroredCount = samples.filter(Boolean).length;
    detectedMirrored = mirroredCount > samples.length / 2;
    locked = true;

    return { decided: true, mirrored: detectedMirrored };
  }

  return { decided: false, mirrored: null };
}

/**
 * Get the current mirror detection state
 */
export function getMirrorState() {
  return { decided: locked, mirrored: detectedMirrored };
}

/**
 * Reset mirror detection (e.g. if camera changes)
 */
export function resetMirrorDetection() {
  samples = [];
  detectedMirrored = null;
  locked = false;
}
