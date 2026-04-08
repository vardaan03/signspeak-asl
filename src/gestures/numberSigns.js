/**
 * ASL Number Sign Definitions (1-10)
 *
 * Numbers 1-5 use one hand, 6-10 use variations.
 * Many overlap with letter shapes — disambiguation is handled
 * by the landmark analyzer and gesture recognizer context.
 *
 * Key overlaps:
 *   1 ≈ D (index up) — but 1 has thumb to side, D has thumb touching middle
 *   2 ≈ V (peace) — identical shape
 *   3 ≈ W (3 fingers) — but 3 has thumb out touching pinky side
 *   4 ≈ B (4 fingers) — identical shape
 *   5 ≈ Hello (open palm) — identical shape
 *   6-9: thumb touches fingertips sequentially
 *   10: thumb up + twist (motion)
 */

import fp from 'fingerpose';

const { Finger, FingerCurl, FingerDirection, GestureDescription } = fp;

// ===== 1 =====
// Index up, thumb to side (NOT touching middle like D)
const one = new GestureDescription('1️⃣ One');
one.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.6);
one.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.4);
one.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
one.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
one.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.3);
one.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.3);
one.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
one.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.3);
one.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
one.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
one.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
one.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== 2 =====
// V/Peace sign — index + middle spread
const two = new GestureDescription('2️⃣ Two');
two.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.8);
two.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
two.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
two.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.7);
two.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.5);
two.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.5);
two.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
two.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.7);
two.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
two.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
two.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
two.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== 3 =====
// Thumb + index + middle up (thumb out, touching pinky/ring side)
const three = new GestureDescription('3️⃣ Three');
three.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
three.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
three.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.8);
three.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
three.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.8);
three.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
three.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
three.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
three.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== 4 =====
// All 4 fingers up, thumb tucked (same as B)
const four = new GestureDescription('4️⃣ Four');
four.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
four.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.6);
four.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
four.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.9);
four.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
four.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.9);
four.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
four.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.9);
four.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
four.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.9);

// ===== 5 =====
// Open palm, all fingers + thumb spread (same as Hello)
const five = new GestureDescription('5️⃣ Five');
five.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
five.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
five.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.7);
five.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
five.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.7);
five.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
five.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.7);
five.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
five.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.7);

// ===== 6 =====
// Thumb touches pinky tip, other 3 fingers up
const six = new GestureDescription('6️⃣ Six');
six.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
six.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.4);
six.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
six.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.9);
six.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
six.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.9);
six.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
six.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.9);
six.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.8);
six.addCurl(Finger.Pinky, FingerCurl.FullCurl, 0.5);

// ===== 7 =====
// Thumb touches ring tip, index + middle + pinky up
const seven = new GestureDescription('7️⃣ Seven');
seven.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
seven.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.4);
seven.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
seven.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.9);
seven.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
seven.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.9);
seven.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.8);
seven.addCurl(Finger.Ring, FingerCurl.FullCurl, 0.5);
seven.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
seven.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.9);

// ===== 8 =====
// Thumb touches middle tip, index + ring + pinky up
const eight = new GestureDescription('8️⃣ Eight');
eight.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
eight.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.4);
eight.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
eight.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.9);
eight.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.8);
eight.addCurl(Finger.Middle, FingerCurl.FullCurl, 0.5);
eight.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
eight.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.9);
eight.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
eight.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.9);

// ===== 9 =====
// Thumb touches index tip, middle + ring + pinky up (like F but named differently)
const nine = new GestureDescription('9️⃣ Nine');
nine.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
nine.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.4);
nine.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.8);
nine.addCurl(Finger.Index, FingerCurl.FullCurl, 0.5);
nine.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
nine.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.9);
nine.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
nine.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.9);
nine.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
nine.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.9);

// ===== 10 =====
// Thumbs up + shake/twist (static: just thumb up)
const ten = new GestureDescription('🔟 Ten');
ten.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
ten.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
ten.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.4);
ten.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.4);
ten.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
ten.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
ten.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
ten.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

export const numberGestures = [
  one, two, three, four, five,
  six, seven, eight, nine, ten,
];

export const numberReference = [
  { letter: '1️⃣', desc: 'Index up, thumb to side' },
  { letter: '2️⃣', desc: 'Index + middle spread (V)' },
  { letter: '3️⃣', desc: 'Thumb + index + middle up' },
  { letter: '4️⃣', desc: 'All 4 fingers up, thumb tucked' },
  { letter: '5️⃣', desc: 'Open palm, all spread' },
  { letter: '6️⃣', desc: 'Thumb touches pinky, 3 up' },
  { letter: '7️⃣', desc: 'Thumb touches ring, 3 up' },
  { letter: '8️⃣', desc: 'Thumb touches middle, 3 up' },
  { letter: '9️⃣', desc: 'Thumb touches index, 3 up' },
  { letter: '🔟', desc: 'Thumbs up + twist' },
];
