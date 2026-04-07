/**
 * Canvas Overlay Module
 * Draws hand landmarks and connections on a canvas overlay
 */

// MediaPipe Hand landmark connections
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [0, 13], [13, 14], [14, 15], [15, 16],// Ring
  [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [5, 9], [9, 13], [13, 17],            // Palm
];

// Finger colors for visual distinction
const FINGER_COLORS = {
  thumb: '#ff80ab',    // Pink
  index: '#64ffda',    // Cyan
  middle: '#b388ff',   // Purple
  ring: '#ffab40',     // Orange
  pinky: '#448aff',    // Blue
  palm: 'rgba(255, 255, 255, 0.3)',
};

function getConnectionColor(startIdx) {
  if (startIdx >= 0 && startIdx <= 4) return FINGER_COLORS.thumb;
  if (startIdx >= 5 && startIdx <= 8) return FINGER_COLORS.index;
  if (startIdx >= 9 && startIdx <= 12) return FINGER_COLORS.middle;
  if (startIdx >= 13 && startIdx <= 16) return FINGER_COLORS.ring;
  if (startIdx >= 17 && startIdx <= 20) return FINGER_COLORS.pinky;
  return FINGER_COLORS.palm;
}

function getLandmarkColor(idx) {
  if (idx === 0) return '#ffffff'; // Wrist
  if (idx <= 4) return FINGER_COLORS.thumb;
  if (idx <= 8) return FINGER_COLORS.index;
  if (idx <= 12) return FINGER_COLORS.middle;
  if (idx <= 16) return FINGER_COLORS.ring;
  if (idx <= 20) return FINGER_COLORS.pinky;
  return '#ffffff';
}

/**
 * Draw the signing region box on canvas
 */
export function drawSigningRegion(ctx, region, width, height, inRegion) {
  const x = region.xMin * width;
  const y = region.yMin * height;
  const w = (region.xMax - region.xMin) * width;
  const h = (region.yMax - region.yMin) * height;

  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = inRegion
    ? 'rgba(105, 240, 174, 0.35)'   // green when hand is inside
    : 'rgba(255, 171, 64, 0.35)';   // orange when outside
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Label
  if (!inRegion) {
    ctx.setLineDash([]);
    ctx.font = '12px Space Grotesk, sans-serif';
    ctx.fillStyle = 'rgba(255, 171, 64, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('Move hand into signing area', width / 2, y - 8);
  }
  ctx.restore();
}

/**
 * Draw hand landmarks on canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} landmarks - Normalised landmarks (0-1)
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export function drawLandmarks(ctx, landmarks, width, height) {
  // Note: canvas is cleared by caller before drawing all hands

  if (!landmarks || landmarks.length === 0) return;

  // Draw connections
  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (!start || !end) continue;

    const sx = start.x * width;
    const sy = start.y * height;
    const ex = end.x * width;
    const ey = end.y * height;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = getConnectionColor(startIdx);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Draw landmarks (dots)
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    const x = lm.x * width;
    const y = lm.y * height;

    // Outer glow
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = getLandmarkColor(i);
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Inner dot
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = getLandmarkColor(i);
    ctx.fill();

    // Fingertips get a brighter dot
    if ([4, 8, 12, 16, 20].includes(i)) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.strokeStyle = getLandmarkColor(i);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}
