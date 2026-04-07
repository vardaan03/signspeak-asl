/**
 * Parametric SVG Hand Icon Generator
 *
 * Creates anatomically proportioned hand silhouettes for ASL letters.
 * Inspired by Spread The Sign's design system and Google's MediaPipe
 * hand landmark topology.
 *
 * Design specs:
 * - ViewBox: 0 0 64 80
 * - Consistent 1.2px stroke at 48px display
 * - Palm rendered as organic rounded shape
 * - Each finger: 3 phalanx segments with proper tapering
 * - Curl states: 0 (extended), 1 (half), 2 (full)
 * - Color: active fingers highlighted, curled fingers dimmed
 */

const C = {
  // Colors
  active: '#5ef0d0',
  dim: '#2a3060',
  palm: '#1e2548',
  palmStroke: '#3a4580',
  motion: '#f0a050',
  body: '#a78bfa',
  bg: '#111828',

  // Stroke
  sw: 1.2,
  swFinger: 1.4,

  // Palm geometry
  palmCx: 32, palmCy: 48,
  palmW: 22, palmH: 18,
  palmR: 8,

  // Finger bases (x positions) and default up-angles
  fingers: [
    { bx: 16, by: 38, angle: -20, len: [9, 8, 7] },    // Index
    { bx: 24, by: 35, angle: -5,  len: [10, 9, 7.5] },  // Middle
    { bx: 32, by: 36, angle: 5,   len: [9.5, 8, 7] },   // Ring
    { bx: 39, by: 39, angle: 18,  len: [7.5, 6.5, 5.5] }, // Pinky
  ],

  // Thumb geometry
  thumb: { bx: 12, by: 50, angle: -55, len: [9, 8] },
};

function rad(deg) { return deg * Math.PI / 180; }

/**
 * Draw a finger as a series of segments.
 * @param {number} bx - base x
 * @param {number} by - base y
 * @param {number} angle - direction in degrees (0 = up, negative = left, positive = right)
 * @param {number[]} lengths - segment lengths [proximal, middle, distal]
 * @param {number} curl - 0 = extended, 1 = half curled, 2 = fully curled
 * @param {string} color - stroke color
 * @returns {string} SVG path
 */
function fingerPath(bx, by, angle, lengths, curl, color) {
  const a = rad(angle - 90); // Convert to math angle (0 = up)
  let x = bx, y = by;
  let currentAngle = a;
  const points = [{ x, y }];

  // Curl adds bend at each joint
  const curlAngles = curl === 0
    ? [0, 0, 0]
    : curl === 1
      ? [0.3, 0.8, 0.6]
      : [0.9, 1.4, 1.0];

  for (let i = 0; i < lengths.length; i++) {
    currentAngle += curlAngles[i];
    x += Math.cos(currentAngle) * lengths[i];
    y += Math.sin(currentAngle) * lengths[i];
    points.push({ x, y });
  }

  // Draw as connected line segments with rounded caps
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
  }

  // Fingertip circle
  const tip = points[points.length - 1];
  const tipR = curl === 2 ? 1.2 : 1.8;

  return `<path d="${d}" stroke="${color}" stroke-width="${C.swFinger}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="${tip.x.toFixed(1)}" cy="${tip.y.toFixed(1)}" r="${tipR}" fill="${color}" opacity="${curl === 2 ? 0.3 : 0.8}"/>`;
}

/**
 * Draw a thumb.
 * @param {number} curl - 0 = out, 1 = across, 2 = tucked
 * @param {string} pos - 'side' | 'up' | 'across' | 'tucked' | 'between'
 */
function thumbPath(curl, pos, color) {
  let bx = C.thumb.bx, by = C.thumb.by;
  let angle = C.thumb.angle;
  let lens = [...C.thumb.len];

  if (pos === 'up') {
    angle = -90;
    bx = 14; by = 46;
  } else if (pos === 'across') {
    angle = -10;
    bx = 14; by = 52;
    lens = [7, 6];
  } else if (pos === 'tucked') {
    angle = 20;
    bx = 14; by = 48;
    lens = [6, 5];
  } else if (pos === 'between') {
    angle = 0;
    bx = 15; by = 46;
    lens = [6, 5];
  } else if (pos === 'out') {
    angle = -130;
    bx = 11; by: 48;
    by = 48;
    lens = [9, 7];
  }

  const a = rad(angle - 90);
  let x = bx, y = by;
  let ca = a;
  const points = [{ x, y }];

  const curlA = curl === 0 ? [0, 0] : curl === 1 ? [0.3, 0.5] : [0.7, 0.9];

  for (let i = 0; i < lens.length; i++) {
    ca += curlA[i];
    x += Math.cos(ca) * lens[i];
    y += Math.sin(ca) * lens[i];
    points.push({ x, y });
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
  }

  const tip = points[points.length - 1];
  return `<path d="${d}" stroke="${color}" stroke-width="${C.swFinger + 0.3}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="${tip.x.toFixed(1)}" cy="${tip.y.toFixed(1)}" r="2" fill="${color}" opacity="0.8"/>`;
}

/**
 * Draw the palm shape
 */
function palmShape() {
  return `<rect x="${C.palmCx - C.palmW}" y="${C.palmCy - C.palmH + 2}" width="${C.palmW * 2}" height="${C.palmH * 2 - 2}" rx="${C.palmR}" ry="${C.palmR}"
    fill="${C.palm}" stroke="${C.palmStroke}" stroke-width="${C.sw}"/>`;
}

/**
 * Generate a complete hand SVG.
 *
 * @param {Object} config
 * @param {number[]} config.fingers - curl state for [index, middle, ring, pinky] (0/1/2)
 * @param {number} config.thumbCurl - 0/1/2
 * @param {string} config.thumbPos - 'side'|'up'|'across'|'tucked'|'between'|'out'
 * @param {number[]} [config.fingerAngles] - custom angles per finger (overrides defaults)
 * @param {boolean[]} [config.highlight] - which fingers to highlight [thumb, index, middle, ring, pinky]
 * @param {string} [config.overlay] - optional overlay element (motion arrow, etc.)
 */
function handSVG(config) {
  const {
    fingers: curls = [0, 0, 0, 0],
    thumbCurl = 0,
    thumbPos = 'side',
    fingerAngles = null,
    highlight = [true, true, true, true, true],
    overlay = '',
  } = config;

  let svg = `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">`;

  // Background
  svg += `<rect width="64" height="80" rx="8" fill="${C.bg}" opacity="0.5"/>`;

  // Palm
  svg += palmShape();

  // Wrist
  svg += `<rect x="22" y="60" width="20" height="14" rx="4" fill="${C.palm}" stroke="${C.palmStroke}" stroke-width="${C.sw}"/>`;

  // Fingers
  for (let i = 0; i < 4; i++) {
    const f = C.fingers[i];
    const angle = fingerAngles ? fingerAngles[i] : f.angle;
    const color = highlight[i + 1] ? C.active : C.dim;
    svg += fingerPath(f.bx, f.by, angle, f.len, curls[i], color);
  }

  // Thumb
  const thumbColor = highlight[0] ? C.active : C.dim;
  svg += thumbPath(thumbCurl, thumbPos, thumbColor);

  // Overlay
  svg += overlay;

  svg += `</svg>`;
  return svg;
}

// ==========================================
// Motion arrow overlay
// ==========================================
function motionArrow(path, color = C.motion) {
  return `<path d="${path}" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 2" fill="none" opacity="0.8"/>
    <circle cx="${path.split(' ').slice(-2)[0]}" cy="${path.split(' ').slice(-1)[0]}" r="2" fill="${color}" opacity="0.7"/>`;
}

// ==========================================
// Body silhouette overlay
// ==========================================
function bodySilhouette(handY = 20) {
  return `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="80" rx="8" fill="${C.bg}" opacity="0.5"/>
    <!-- Head -->
    <circle cx="32" cy="18" r="8" stroke="${C.body}" stroke-width="1.2" fill="none" opacity="0.6"/>
    <!-- Body -->
    <line x1="32" y1="26" x2="32" y2="52" stroke="${C.body}" stroke-width="1.2" opacity="0.4"/>
    <!-- Shoulders -->
    <line x1="20" y1="32" x2="44" y2="32" stroke="${C.body}" stroke-width="1.2" opacity="0.4"/>
    <!-- Active arm reaching to face -->
    <path d="M 44 32 Q 50 28 48 ${handY}" stroke="${C.body}" stroke-width="1.5" fill="none" opacity="0.7"/>
    <!-- Hand indicator -->
    <circle cx="48" cy="${handY}" r="4" stroke="${C.active}" stroke-width="1.2" fill="rgba(94,240,208,0.15)"/>
    <circle cx="48" cy="${handY}" r="1.5" fill="${C.active}"/>
    <!-- Direction arrow -->
    <path d="M 48 ${handY} L 48 ${handY - 6}" stroke="${C.active}" stroke-width="1" stroke-linecap="round" marker-end="none" opacity="0.6" stroke-dasharray="2 1.5"/>
  </svg>`;
}

// ==========================================
// ASL Letter Definitions
// ==========================================

const ASL_HANDS = {
  // --- FIST VARIANTS ---
  'A': () => handSVG({
    fingers: [2, 2, 2, 2], thumbCurl: 0, thumbPos: 'side',
    highlight: [true, false, false, false, false],
  }),
  'S': () => handSVG({
    fingers: [2, 2, 2, 2], thumbCurl: 1, thumbPos: 'across',
    highlight: [true, false, false, false, false],
  }),
  'E': () => handSVG({
    fingers: [2, 2, 2, 2], thumbCurl: 1, thumbPos: 'tucked',
    highlight: [false, false, false, false, false],
  }),
  'T': () => handSVG({
    fingers: [2, 2, 2, 2], thumbCurl: 1, thumbPos: 'between',
    highlight: [true, false, false, false, false],
  }),
  'M': () => handSVG({
    fingers: [2, 2, 2, 2], thumbCurl: 2, thumbPos: 'tucked',
    fingerAngles: [30, 25, 20, 25],
    highlight: [false, false, false, false, false],
  }),
  'N': () => handSVG({
    fingers: [2, 2, 2, 2], thumbCurl: 2, thumbPos: 'between',
    fingerAngles: [30, 25, 20, 25],
    highlight: [true, false, false, false, false],
  }),

  // --- FLAT / OPEN HAND ---
  'B': () => handSVG({
    fingers: [0, 0, 0, 0], thumbCurl: 2, thumbPos: 'across',
    highlight: [false, true, true, true, true],
  }),

  // --- CURVED ---
  'C': () => handSVG({
    fingers: [1, 1, 1, 1], thumbCurl: 0, thumbPos: 'side',
    highlight: [true, true, true, true, true],
  }),
  'O': () => handSVG({
    fingers: [2, 2, 2, 2], thumbCurl: 1, thumbPos: 'side',
    highlight: [true, true, true, true, true],
    overlay: `<ellipse cx="18" cy="42" rx="6" ry="8" stroke="${C.active}" stroke-width="0.8" fill="none" opacity="0.3"/>`,
  }),

  // --- SINGLE FINGER UP ---
  'D': () => handSVG({
    fingers: [0, 2, 2, 2], thumbCurl: 1, thumbPos: 'across',
    highlight: [false, true, false, false, false],
  }),
  'I': () => handSVG({
    fingers: [2, 2, 2, 0], thumbCurl: 1, thumbPos: 'across',
    highlight: [false, false, false, false, true],
  }),

  // --- TWO FINGERS ---
  'U': () => handSVG({
    fingers: [0, 0, 2, 2], thumbCurl: 1, thumbPos: 'across',
    fingerAngles: [-12, -2, 20, 25],
    highlight: [false, true, true, false, false],
  }),
  'R': () => handSVG({
    fingers: [0, 0, 2, 2], thumbCurl: 1, thumbPos: 'across',
    fingerAngles: [-8, -8, 20, 25],
    highlight: [false, true, true, false, false],
    overlay: `<line x1="18" y1="12" x2="22" y2="10" stroke="${C.active}" stroke-width="0.6" opacity="0.4"/>`,
  }),
  'V': () => handSVG({
    fingers: [0, 0, 2, 2], thumbCurl: 1, thumbPos: 'across',
    fingerAngles: [-28, 8, 20, 25],
    highlight: [false, true, true, false, false],
  }),
  'K': () => handSVG({
    fingers: [0, 0, 2, 2], thumbCurl: 0, thumbPos: 'between',
    fingerAngles: [-20, 5, 20, 25],
    highlight: [true, true, true, false, false],
  }),
  'H': () => handSVG({
    fingers: [0, 0, 2, 2], thumbCurl: 1, thumbPos: 'across',
    fingerAngles: [70, 75, 20, 25],
    highlight: [false, true, true, false, false],
  }),

  // --- THREE FINGERS ---
  'W': () => handSVG({
    fingers: [0, 0, 0, 2], thumbCurl: 1, thumbPos: 'across',
    highlight: [false, true, true, true, false],
  }),

  // --- THUMB + INDEX ---
  'F': () => handSVG({
    fingers: [2, 0, 0, 0], thumbCurl: 1, thumbPos: 'side',
    highlight: [true, false, true, true, true],
    overlay: `<ellipse cx="14" cy="40" rx="4" ry="5" stroke="${C.active}" stroke-width="0.6" fill="none" opacity="0.3"/>`,
  }),
  'L': () => handSVG({
    fingers: [0, 2, 2, 2], thumbCurl: 0, thumbPos: 'out',
    highlight: [true, true, false, false, false],
  }),

  // --- SIDEWAYS POINTING ---
  'G': () => handSVG({
    fingers: [0, 2, 2, 2], thumbCurl: 0, thumbPos: 'side',
    fingerAngles: [70, 20, 20, 25],
    highlight: [true, true, false, false, false],
  }),
  'Q': () => handSVG({
    fingers: [0, 2, 2, 2], thumbCurl: 0, thumbPos: 'side',
    fingerAngles: [120, 100, 100, 100],
    highlight: [true, true, false, false, false],
  }),
  'P': () => handSVG({
    fingers: [0, 0, 2, 2], thumbCurl: 0, thumbPos: 'side',
    fingerAngles: [100, 110, 20, 25],
    highlight: [true, true, true, false, false],
  }),

  // --- HOOK / SPECIAL ---
  'X': () => handSVG({
    fingers: [1, 2, 2, 2], thumbCurl: 1, thumbPos: 'across',
    highlight: [false, true, false, false, false],
  }),
  'Y': () => handSVG({
    fingers: [2, 2, 2, 0], thumbCurl: 0, thumbPos: 'out',
    highlight: [true, false, false, false, true],
  }),

  // --- MOTION LETTERS ---
  'J': () => {
    const base = handSVG({
      fingers: [2, 2, 2, 0], thumbCurl: 1, thumbPos: 'across',
      highlight: [false, false, false, false, true],
      overlay: `<path d="M 42 10 L 42 22 Q 42 30 34 28" stroke="${C.motion}" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3 2.5" fill="none"/>
        <polygon points="33,26 36,30 31,30" fill="${C.motion}" opacity="0.7"/>
        <text x="46" y="14" font-size="7" font-family="Inter,sans-serif" fill="${C.motion}" font-weight="600" opacity="0.6">J</text>`,
    });
    return base;
  },
  'Z': () => {
    const base = handSVG({
      fingers: [0, 2, 2, 2], thumbCurl: 1, thumbPos: 'across',
      highlight: [false, true, false, false, false],
      overlay: `<path d="M 12 8 L 32 8 L 14 22 L 34 22" stroke="${C.motion}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 2.5" fill="none"/>
        <polygon points="35,20 35,25 31,22" fill="${C.motion}" opacity="0.7"/>
        <text x="38" y="12" font-size="7" font-family="Inter,sans-serif" fill="${C.motion}" font-weight="600" opacity="0.6">Z</text>`,
    });
    return base;
  },

  // --- COMMON SIGNS ---
  'thumbsUp': () => handSVG({
    fingers: [2, 2, 2, 2], thumbCurl: 0, thumbPos: 'up',
    highlight: [true, false, false, false, false],
  }),
  'thumbsDown': () => handSVG({
    fingers: [2, 2, 2, 2], thumbCurl: 0, thumbPos: 'side',
    fingerAngles: [20, 20, 20, 25],
    highlight: [true, false, false, false, false],
    overlay: `<line x1="10" y1="54" x2="10" y2="70" stroke="${C.active}" stroke-width="2" stroke-linecap="round"/>
      <polygon points="7,68 13,68 10,74" fill="${C.active}" opacity="0.7"/>`,
  }),
  'openPalm': () => handSVG({
    fingers: [0, 0, 0, 0], thumbCurl: 0, thumbPos: 'out',
    fingerAngles: [-25, -8, 8, 22],
    highlight: [true, true, true, true, true],
  }),
  'fist': () => handSVG({
    fingers: [2, 2, 2, 2], thumbCurl: 2, thumbPos: 'across',
    highlight: [false, false, false, false, false],
  }),
  'iLoveYou': () => handSVG({
    fingers: [0, 2, 2, 0], thumbCurl: 0, thumbPos: 'out',
    highlight: [true, true, false, false, true],
  }),
  'pointing': () => handSVG({
    fingers: [0, 2, 2, 2], thumbCurl: 1, thumbPos: 'across',
    highlight: [false, true, false, false, false],
  }),
  'ok': () => handSVG({
    fingers: [2, 0, 0, 0], thumbCurl: 1, thumbPos: 'side',
    highlight: [true, false, true, true, true],
    overlay: `<ellipse cx="14" cy="42" rx="5" ry="6" stroke="${C.active}" stroke-width="1" fill="rgba(94,240,208,0.08)"/>`,
  }),
  'peace': () => handSVG({
    fingers: [0, 0, 2, 2], thumbCurl: 1, thumbPos: 'across',
    fingerAngles: [-30, 10, 20, 25],
    highlight: [false, true, true, false, false],
  }),
  'callMe': () => handSVG({
    fingers: [2, 2, 2, 0], thumbCurl: 0, thumbPos: 'out',
    highlight: [true, false, false, false, true],
  }),
  'rockOn': () => handSVG({
    fingers: [0, 2, 2, 0], thumbCurl: 1, thumbPos: 'across',
    highlight: [false, true, false, false, true],
  }),

  // --- BODY-RELATIVE ---
  'thankYou': () => bodySilhouette(18),
  'please': () => bodySilhouette(38),
  'think': () => {
    return `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="80" rx="8" fill="${C.bg}" opacity="0.5"/>
      <circle cx="32" cy="20" r="9" stroke="${C.body}" stroke-width="1.2" fill="none" opacity="0.6"/>
      <line x1="32" y1="29" x2="32" y2="55" stroke="${C.body}" stroke-width="1.2" opacity="0.4"/>
      <line x1="20" y1="36" x2="44" y2="36" stroke="${C.body}" stroke-width="1.2" opacity="0.4"/>
      <path d="M 44 36 Q 48 30 42 18" stroke="${C.body}" stroke-width="1.5" fill="none" opacity="0.7"/>
      <circle cx="42" cy="16" r="2" fill="${C.active}" opacity="0.8"/>
      <line x1="42" y1="16" x2="36" y2="16" stroke="${C.active}" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 1.5"/>
      <text x="32" y="72" font-size="6" font-family="Inter,sans-serif" fill="${C.body}" text-anchor="middle" opacity="0.5">THINK</text>
    </svg>`;
  },
  'eat': () => {
    return `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="80" rx="8" fill="${C.bg}" opacity="0.5"/>
      <circle cx="32" cy="20" r="9" stroke="${C.body}" stroke-width="1.2" fill="none" opacity="0.6"/>
      <ellipse cx="32" cy="27" rx="3" ry="1.5" stroke="${C.body}" stroke-width="0.8" fill="none" opacity="0.4"/>
      <line x1="32" y1="29" x2="32" y2="55" stroke="${C.body}" stroke-width="1.2" opacity="0.4"/>
      <line x1="20" y1="36" x2="44" y2="36" stroke="${C.body}" stroke-width="1.2" opacity="0.4"/>
      <path d="M 44 36 Q 50 30 38 24" stroke="${C.body}" stroke-width="1.5" fill="none" opacity="0.7"/>
      <circle cx="36" cy="24" r="3" stroke="${C.active}" stroke-width="1" fill="rgba(94,240,208,0.1)"/>
      <circle cx="36" cy="24" r="1" fill="${C.active}"/>
      <text x="32" y="72" font-size="6" font-family="Inter,sans-serif" fill="${C.body}" text-anchor="middle" opacity="0.5">EAT</text>
    </svg>`;
  },
};

// ==========================================
// Map reference data to icon keys
// ==========================================

const LETTER_ICON_MAP = {
  'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F',
  'G': 'G', 'H': 'H', 'I': 'I', 'J': 'J', 'K': 'K', 'L': 'L',
  'M': 'M', 'N': 'N', 'O': 'O', 'P': 'P', 'Q': 'Q', 'R': 'R',
  'S': 'S', 'T': 'T', 'U': 'U', 'V': 'V', 'W': 'W', 'X': 'X',
  'Y': 'Y', 'Z': 'Z',
};

const SIGN_ICON_MAP = {
  '\uD83D\uDC4D': 'thumbsUp',   // 👍
  '\uD83D\uDC4E': 'thumbsDown', // 👎
  '\uD83D\uDD90': 'openPalm',   // 🖐
  '\u270A': 'fist',              // ✊
  '\uD83E\uDD1F': 'iLoveYou',   // 🤟
  '\u261D': 'pointing',         // ☝
};

const CUSTOM_ICON_MAP = {
  'TY': 'thankYou',
  'PL': 'please',
  'TH': 'think',
  'EA': 'eat',
  'OK': 'ok',
  'PC': 'peace',
  'CL': 'callMe',
  'RK': 'rockOn',
  'GD': 'thumbsUp',
};

/**
 * Get SVG icon for a letter
 */
export function getLetterIcon(letter) {
  const key = LETTER_ICON_MAP[letter];
  if (key && ASL_HANDS[key]) return ASL_HANDS[key]();
  return ASL_HANDS['A'](); // fallback
}

/**
 * Get SVG icon for a common sign (by emoji)
 */
export function getSignIcon(emoji) {
  const key = SIGN_ICON_MAP[emoji];
  if (key && ASL_HANDS[key]) return ASL_HANDS[key]();
  return ASL_HANDS['openPalm'](); // fallback
}

/**
 * Get SVG icon for a custom gesture
 */
export function getCustomIcon(shortCode) {
  const key = CUSTOM_ICON_MAP[shortCode];
  if (key && ASL_HANDS[key]) return ASL_HANDS[key]();
  return ASL_HANDS['openPalm'](); // fallback
}
