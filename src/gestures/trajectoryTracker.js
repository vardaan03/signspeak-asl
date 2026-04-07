/**
 * Trajectory Tracker — Motion-Based Sign Detection
 *
 * Tracks fingertip positions across multiple frames and matches
 * the traced path against known letter shapes (J, Z).
 *
 * J: Pinky traces a J-curve (down then curve left)
 * Z: Index finger traces a Z (right, diagonal down-left, right)
 *
 * Uses simplified path matching with direction segments.
 */

const TRAJECTORY_LENGTH = 30;         // Max frames to track
const MIN_TRAJECTORY_LENGTH = 12;     // Min frames needed for a match
const MIN_PATH_DISTANCE = 0.08;       // Min total movement (normalized) to count as motion
const DIRECTION_TOLERANCE = 0.6;      // Cosine similarity threshold for direction matching

// Store recent fingertip positions
let pinkyTrajectory = [];   // For J
let indexTrajectory = [];   // For Z
let frameCount = 0;

/**
 * Record fingertip positions for motion tracking.
 * Call this every frame when a hand is detected.
 * @param {Array} landmarks - MediaPipe normalized landmarks (21 points)
 */
export function recordTrajectory(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    // Hand lost — reset
    pinkyTrajectory = [];
    indexTrajectory = [];
    return;
  }

  frameCount++;

  const pinkyTip = landmarks[20];
  const indexTip = landmarks[8];

  pinkyTrajectory.push({ x: pinkyTip.x, y: pinkyTip.y, frame: frameCount });
  indexTrajectory.push({ x: indexTip.x, y: indexTip.y, frame: frameCount });

  // Keep buffer bounded
  if (pinkyTrajectory.length > TRAJECTORY_LENGTH) pinkyTrajectory.shift();
  if (indexTrajectory.length > TRAJECTORY_LENGTH) indexTrajectory.shift();
}

/**
 * Reset trajectory buffers
 */
export function resetTrajectory() {
  pinkyTrajectory = [];
  indexTrajectory = [];
}

/**
 * Calculate total path distance of a trajectory
 */
function pathDistance(traj) {
  let total = 0;
  for (let i = 1; i < traj.length; i++) {
    const dx = traj[i].x - traj[i - 1].x;
    const dy = traj[i].y - traj[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

/**
 * Simplify trajectory into direction segments.
 * Groups consecutive points into segments and returns the dominant direction of each.
 * Returns array of { dx, dy } normalized direction vectors.
 */
function getDirectionSegments(traj, numSegments) {
  if (traj.length < 2) return [];

  const segLen = Math.floor(traj.length / numSegments);
  if (segLen < 2) return [];

  const segments = [];
  for (let s = 0; s < numSegments; s++) {
    const start = s * segLen;
    const end = Math.min(start + segLen, traj.length - 1);

    const dx = traj[end].x - traj[start].x;
    const dy = traj[end].y - traj[start].y;
    const mag = Math.sqrt(dx * dx + dy * dy);

    if (mag < 0.001) {
      segments.push({ dx: 0, dy: 0 });
    } else {
      segments.push({ dx: dx / mag, dy: dy / mag });
    }
  }
  return segments;
}

/**
 * Cosine similarity between two 2D direction vectors
 */
function cosineSim(a, b) {
  const magA = Math.sqrt(a.dx * a.dx + a.dy * a.dy);
  const magB = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
  if (magA < 0.001 || magB < 0.001) return 0;
  return (a.dx * b.dx + a.dy * b.dy) / (magA * magB);
}

/**
 * Match trajectory against the J pattern.
 * J = pinky starts up, moves down, then curves to the left.
 * We split into 3 segments: down, down-left, left
 */
function matchJ(traj) {
  if (traj.length < MIN_TRAJECTORY_LENGTH) return 0;
  if (pathDistance(traj) < MIN_PATH_DISTANCE) return 0;

  const segs = getDirectionSegments(traj, 3);
  if (segs.length < 3) return 0;

  // Expected J pattern (in normalized coordinates where y increases downward):
  // Segment 1: Downward { dx: 0, dy: 1 }
  // Segment 2: Down-left { dx: -0.7, dy: 0.7 }
  // Segment 3: Left { dx: -1, dy: 0 }
  const jPattern = [
    { dx: 0, dy: 1 },
    { dx: -0.7, dy: 0.7 },
    { dx: -1, dy: 0 },
  ];

  let totalSim = 0;
  for (let i = 0; i < 3; i++) {
    const sim = cosineSim(segs[i], jPattern[i]);
    if (sim < DIRECTION_TOLERANCE) return 0; // One bad segment kills the match
    totalSim += sim;
  }

  // Score 0-10 based on average similarity
  return Math.min(10, (totalSim / 3) * 10);
}

/**
 * Match trajectory against the Z pattern.
 * Z = index moves right, then diagonal down-left, then right again.
 * We split into 3 segments: right, down-left, right
 */
function matchZ(traj) {
  if (traj.length < MIN_TRAJECTORY_LENGTH) return 0;
  if (pathDistance(traj) < MIN_PATH_DISTANCE) return 0;

  const segs = getDirectionSegments(traj, 3);
  if (segs.length < 3) return 0;

  // Expected Z pattern:
  // Segment 1: Right { dx: 1, dy: 0 }
  // Segment 2: Diagonal down-left { dx: -0.7, dy: 0.7 }
  // Segment 3: Right { dx: 1, dy: 0 }
  const zPattern = [
    { dx: 1, dy: 0 },
    { dx: -0.7, dy: 0.7 },
    { dx: 1, dy: 0 },
  ];

  let totalSim = 0;
  for (let i = 0; i < 3; i++) {
    const sim = cosineSim(segs[i], zPattern[i]);
    if (sim < DIRECTION_TOLERANCE) return 0;
    totalSim += sim;
  }

  return Math.min(10, (totalSim / 3) * 10);
}

/**
 * Check for motion-based signs.
 * Call this each frame after recordTrajectory().
 *
 * @param {Array} landmarks - Current MediaPipe landmarks
 * @param {Object} features - Hand features from extractHandFeatures()
 * @returns {Array<{name: string, score: number}>} Detected motion signs
 */
export function detectMotionSigns(landmarks, features) {
  if (!landmarks || !features) return [];

  const results = [];

  // J detection: requires pinky extended, others curled (like I hand shape + motion)
  if (features.pinkyExtended &&
      !features.indexExtended &&
      !features.middleExtended &&
      !features.ringExtended) {
    const jScore = matchJ(pinkyTrajectory);
    if (jScore > 6) {
      results.push({ name: 'J', score: jScore });
      // Clear trajectory after successful detection to avoid re-triggering
      pinkyTrajectory = [];
    }
  }

  // Z detection: requires index extended, others curled (like 1/D hand shape + motion)
  if (features.indexExtended &&
      !features.middleExtended &&
      !features.ringExtended &&
      !features.pinkyExtended) {
    const zScore = matchZ(indexTrajectory);
    if (zScore > 6) {
      results.push({ name: 'Z', score: zScore });
      indexTrajectory = [];
    }
  }

  return results;
}
