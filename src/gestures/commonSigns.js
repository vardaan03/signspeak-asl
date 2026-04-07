/**
 * Common Sign Gesture Definitions
 * Defines Fingerpose gesture descriptions for common ASL signs
 * 
 * These are simplified static representations. Many real signs
 * involve motion, but we capture the "hold" position.
 */

import fp from 'fingerpose';

const { Finger, FingerCurl, FingerDirection, GestureDescription } = fp;

// ===== THUMBS UP (Yes / Good) =====
const thumbsUp = new GestureDescription('👍 Yes');
thumbsUp.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
thumbsUp.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
thumbsUp.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
thumbsUp.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
thumbsUp.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
thumbsUp.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== THUMBS DOWN (No / Bad) =====
const thumbsDown = new GestureDescription('👎 No');
thumbsDown.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
thumbsDown.addDirection(Finger.Thumb, FingerDirection.VerticalDown, 1.0);
thumbsDown.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
thumbsDown.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
thumbsDown.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
thumbsDown.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== OPEN PALM (Hello / Stop) =====
const openPalm = new GestureDescription('🖐 Hello');
openPalm.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
openPalm.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.5);
openPalm.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.5);
openPalm.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.5);
openPalm.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.5);
openPalm.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
openPalm.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.7);
openPalm.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
openPalm.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.7);
openPalm.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
openPalm.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.7);
openPalm.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
openPalm.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.7);

// ===== FIST (Wait / Power) =====
const fist = new GestureDescription('✊ Wait');
fist.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
fist.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fist.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fist.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fist.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== ILY (I Love You) =====
// Thumb, index, and pinky extended; middle and ring curled
const iLoveYou = new GestureDescription('🤟 I Love You');
iLoveYou.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
iLoveYou.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
iLoveYou.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.7);
iLoveYou.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
iLoveYou.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
iLoveYou.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
iLoveYou.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.7);

// ===== POINTING (You / That) =====
const pointing = new GestureDescription('☝ You');
pointing.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.6);
pointing.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);
pointing.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
pointing.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.9);
pointing.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
pointing.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
pointing.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

export const commonGestures = [
  thumbsUp,
  thumbsDown,
  openPalm,
  fist,
  iLoveYou,
  pointing,
];

export const commonSignsReference = [
  { letter: '👍', desc: 'Thumb up, all fingers curled into fist' },
  { letter: '👎', desc: 'Thumb down, all fingers curled into fist' },
  { letter: '🖐', desc: 'Open palm, all fingers spread & extended up' },
  { letter: '✊', desc: 'Closed fist, all fingers fully curled' },
  { letter: '🤟', desc: 'Thumb + index + pinky extended, middle & ring curled' },
  { letter: '☝', desc: 'Index finger pointing up, all others curled' },
];
