// Local 3D math helpers for two-hand interaction analysis
function dist3D(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2);
}
function vec(p1, p2) {
  return { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
}
function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}
function cross(v1, v2) {
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  };
}
function normalize(v) {
  const len = Math.sqrt(dot(v, v));
  return len === 0 ? { x: 0, y: 0, z: 0 } : { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Two-Hand Interaction Analyzer
 * 
 * Required for languages like British Sign Language (BSL) where 
 * fingerspelling fundamentally relies on the interaction between two hands 
 * (e.g., pointing to vowels on the palm).
 */

export function analyzeTwoHands(hands) {
  if (!hands || hands.length < 2) return null;
  
  // Identify dominant and non-dominant hand.
  // This could be configured in user settings. For now, assume Hand 0 is dominant, Hand 1 is non-dominant
  // or figure it out dynamically based on palm facing.
  const [hand0, hand1] = hands;
  
  // For two-handed gestures, we track distances between fingertips of dominant hand
  // and specific landmarks (like palm, finger bases) of non-dominant hand.
  
  const interactionState = {
    touching: false,
    activePoints: []
  };

  // Example: Check if dominant index tip is touching non-dominant palm (BSL 'A')
  const domIndexTip = hand0[8];
  const ndomThumbTip = hand1[4];
  const ndomIndexTip = hand1[8];
  const ndomMiddleTip = hand1[12];
  const ndomRingTip = hand1[16];
  const ndomPinkyTip = hand1[20];
  const ndomPalm = hand1[0];

  const palmSize = dist3D(hand1[0], hand1[9]);
  const touchThreshold = palmSize * 0.4;
  
  // Check index to non-dominant fingertips (BSL Vowels: A E I O U)
  const distances = {
    'ndom_thumb': dist3D(domIndexTip, ndomThumbTip), // BSL A
    'ndom_index': dist3D(domIndexTip, ndomIndexTip), // BSL E
    'ndom_middle': dist3D(domIndexTip, ndomMiddleTip), // BSL I
    'ndom_ring': dist3D(domIndexTip, ndomRingTip), // BSL O
    'ndom_pinky': dist3D(domIndexTip, ndomPinkyTip), // BSL U
    'ndom_palm': dist3D(domIndexTip, ndomPalm)
  };

  for (const [key, dist] of Object.entries(distances)) {
    if (dist < touchThreshold) {
      interactionState.touching = true;
      interactionState.activePoints.push(key);
    }
  }

  // Calculate relative orientation (are palms facing each other?)
  const hand0Normal = cross(vec(hand0[0], hand0[5]), vec(hand0[0], hand0[17]));
  const hand1Normal = cross(vec(hand1[0], hand1[5]), vec(hand1[0], hand1[17]));
  const relativeDirection = dot(normalize(hand0Normal), normalize(hand1Normal));
  
  interactionState.palmsFacingEachOther = relativeDirection < -0.5;

  return interactionState;
}

/**
 * Disambiguates two-handed interactions based on the active hand and positions.
 */
export function matchTwoHandGesture(interactionState) {
  if (!interactionState || !interactionState.touching) return null;

  // Extremely basic examples for BSL vowels
  if (interactionState.activePoints.includes('ndom_thumb')) return 'A';
  if (interactionState.activePoints.includes('ndom_index')) return 'E';
  if (interactionState.activePoints.includes('ndom_middle')) return 'I';
  if (interactionState.activePoints.includes('ndom_ring')) return 'O';
  if (interactionState.activePoints.includes('ndom_pinky')) return 'U';

  return null;
}
