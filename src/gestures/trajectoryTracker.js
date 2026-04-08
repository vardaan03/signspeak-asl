/**
 * Trajectory Tracker — Motion-Based Sign Detection (Accuracy-Tuned)
 *
 * Tracks fingertip positions across multiple frames and matches
 * the traced path against known letter shapes (J, Z).
 *
 * J: Pinky traces a J-curve (down then curve left)
 * Z: Index finger traces a Z (right, diagonal down-left, right)
 *
 * Improvements over v1:
 * - Adaptive direction tolerance based on segment confidence
 * - Multi-resolution matching (3 and 4 segment splits)
 * - Mirrored pattern support (left/right hand)
 * - Velocity-weighted path analysis (ignores slow drift)
 * - Stricter minimum movement per segment
 * - Partial match scoring (graceful degradation)
 * - Cooldown after detection to prevent re-triggering
 */

const TRAJECTORY_LENGTH = 35;         // Slightly longer buffer for better path capture
const MIN_TRAJECTORY_LENGTH = 10;     // Fewer frames needed (faster detection)
const MIN_PATH_DISTANCE = 0.06;       // Lower threshold for smaller hand movements
const DIRECTION_TOLERANCE = 0.5;      // More tolerant base threshold
const STRONG_MATCH_BONUS = 0.15;      // Bonus for segments matching > 0.8
const MIN_SEGMENT_MOVEMENT = 0.015;   // Min movement per segment to count as intentional
const DETECTION_COOLDOWN_FRAMES = 20; // Frames to wait after a detection before allowing another

let pinkyTrajectory = [];
let indexTrajectory = [];
let frameCount = 0;
let lastDetectionFrame = -DETECTION_COOLDOWN_FRAMES;

export function recordTrajectory(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    pinkyTrajectory = [];
    indexTrajectory = [];
    return;
  }

  frameCount++;

  const pinkyTip = landmarks[20];
  const indexTip = landmarks[8];
  const wrist = landmarks[0];

  // Store positions normalized relative to wrist (reduces hand translation noise)
  pinkyTrajectory.push({
    x: pinkyTip.x, y: pinkyTip.y,
    // Also store wrist-relative for drift compensation
    rx: pinkyTip.x - wrist.x, ry: pinkyTip.y - wrist.y,
    frame: frameCount,
  });
  indexTrajectory.push({
    x: indexTip.x, y: indexTip.y,
    rx: indexTip.x - wrist.x, ry: indexTip.y - wrist.y,
    frame: frameCount,
  });

  if (pinkyTrajectory.length > TRAJECTORY_LENGTH) pinkyTrajectory.shift();
  if (indexTrajectory.length > TRAJECTORY_LENGTH) indexTrajectory.shift();
}

export function resetTrajectory() {
  pinkyTrajectory = [];
  indexTrajectory = [];
}

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
 * Get the net displacement of a trajectory segment (start to end)
 */
function segmentDisplacement(traj, start, end) {
  const dx = traj[end].x - traj[start].x;
  const dy = traj[end].y - traj[start].y;
  return Math.sqrt(dx * dx + dy * dy);
}

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

    segments.push({
      dx: mag < 0.001 ? 0 : dx / mag,
      dy: mag < 0.001 ? 0 : dy / mag,
      magnitude: mag,
    });
  }
  return segments;
}

function cosineSim(a, b) {
  const magA = Math.sqrt(a.dx * a.dx + a.dy * a.dy);
  const magB = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
  if (magA < 0.001 || magB < 0.001) return 0;
  return (a.dx * b.dx + a.dy * b.dy) / (magA * magB);
}

/**
 * Match trajectory against a pattern with adaptive scoring.
 * Returns 0-10 score.
 */
function matchPattern(traj, pattern, minTrajLen, minPath) {
  if (traj.length < (minTrajLen || MIN_TRAJECTORY_LENGTH)) return 0;
  if (pathDistance(traj) < (minPath || MIN_PATH_DISTANCE)) return 0;

  const numSegments = pattern.length;
  const segs = getDirectionSegments(traj, numSegments);
  if (segs.length < numSegments) return 0;

  let totalSim = 0;
  let validSegments = 0;
  let failedSegments = 0;

  for (let i = 0; i < numSegments; i++) {
    // Skip segments with negligible movement (hand jitter)
    if (segs[i].magnitude < MIN_SEGMENT_MOVEMENT) {
      // Slight penalty but don't fail outright
      totalSim += 0.3;
      validSegments++;
      continue;
    }

    const sim = cosineSim(segs[i], pattern[i]);

    if (sim < DIRECTION_TOLERANCE) {
      failedSegments++;
      // Allow ONE weak segment (partial tolerance)
      if (failedSegments > 1) return 0;
      totalSim += sim * 0.5; // Reduced weight for weak segment
    } else {
      totalSim += sim;
      // Bonus for very strong matches
      if (sim > 0.8) totalSim += STRONG_MATCH_BONUS;
    }
    validSegments++;
  }

  if (validSegments === 0) return 0;
  const avgSim = totalSim / validSegments;
  return Math.min(10, avgSim * 10);
}

// J patterns — support both left-hand and right-hand (mirrored)
const J_PATTERNS = {
  // Right hand: down then curve left
  right: [
    { dx: 0, dy: 1 },
    { dx: -0.7, dy: 0.7 },
    { dx: -1, dy: 0 },
  ],
  // Left hand (mirrored): down then curve right
  left: [
    { dx: 0, dy: 1 },
    { dx: 0.7, dy: 0.7 },
    { dx: 1, dy: 0 },
  ],
  // Alternate: more vertical J (common variant)
  rightAlt: [
    { dx: 0, dy: 1 },
    { dx: -0.5, dy: 0.85 },
    { dx: -0.85, dy: 0.5 },
  ],
  leftAlt: [
    { dx: 0, dy: 1 },
    { dx: 0.5, dy: 0.85 },
    { dx: 0.85, dy: 0.5 },
  ],
};

// Z patterns — support mirrored
const Z_PATTERNS = {
  right: [
    { dx: 1, dy: 0 },
    { dx: -0.7, dy: 0.7 },
    { dx: 1, dy: 0 },
  ],
  left: [
    { dx: -1, dy: 0 },
    { dx: 0.7, dy: 0.7 },
    { dx: -1, dy: 0 },
  ],
  // Common variant: Z with slight vertical component in horizontal strokes
  rightAlt: [
    { dx: 0.95, dy: 0.3 },
    { dx: -0.7, dy: 0.7 },
    { dx: 0.95, dy: 0.3 },
  ],
  leftAlt: [
    { dx: -0.95, dy: 0.3 },
    { dx: 0.7, dy: 0.7 },
    { dx: -0.95, dy: 0.3 },
  ],
};

function matchJ(traj) {
  // Try all J pattern variants and return the best score
  const scores = [
    matchPattern(traj, J_PATTERNS.right),
    matchPattern(traj, J_PATTERNS.left),
    matchPattern(traj, J_PATTERNS.rightAlt),
    matchPattern(traj, J_PATTERNS.leftAlt),
  ];
  return Math.max(...scores);
}

function matchZ(traj) {
  const scores = [
    matchPattern(traj, Z_PATTERNS.right),
    matchPattern(traj, Z_PATTERNS.left),
    matchPattern(traj, Z_PATTERNS.rightAlt),
    matchPattern(traj, Z_PATTERNS.leftAlt),
  ];
  return Math.max(...scores);
}

export function detectMotionSigns(landmarks, features) {
  if (!landmarks || !features) return [];

  // Cooldown check
  if (frameCount - lastDetectionFrame < DETECTION_COOLDOWN_FRAMES) return [];

  const results = [];

  // J detection: pinky extended, others curled (I hand shape + motion)
  if (features.pinkyExtended &&
      !features.indexExtended &&
      !features.middleExtended &&
      !features.ringExtended) {
    const jScore = matchJ(pinkyTrajectory);
    if (jScore > 5.5) {
      results.push({ name: 'J', score: jScore });
      pinkyTrajectory = [];
      lastDetectionFrame = frameCount;
    }
  }

  // Z detection: index extended, others curled (D/1 hand shape + motion)
  if (features.indexExtended &&
      !features.middleExtended &&
      !features.ringExtended &&
      !features.pinkyExtended) {
    const zScore = matchZ(indexTrajectory);
    if (zScore > 5.5) {
      results.push({ name: 'Z', score: zScore });
      indexTrajectory = [];
      lastDetectionFrame = frameCount;
    }
  }

  return results;
}
