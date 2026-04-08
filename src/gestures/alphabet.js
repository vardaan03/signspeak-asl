/**
 * ASL Alphabet Gesture Definitions (Accuracy-Tuned)
 * Defines Fingerpose gesture descriptions for ASL fingerspelling (A-Y)
 *
 * Each letter is defined by finger curl and direction rules with
 * carefully tuned weights to minimize cross-letter confusion.
 *
 * Fingerpose finger reference:
 *   0 = Thumb, 1 = Index, 2 = Middle, 3 = Ring, 4 = Pinky
 *
 * Curl states: NoCurl, HalfCurl, FullCurl
 * Directions: VerticalUp, VerticalDown, HorizontalLeft, HorizontalRight,
 *             DiagonalUpLeft, DiagonalUpRight, DiagonalDownLeft, DiagonalDownRight
 *
 * Accuracy improvements:
 * - Tighter curl constraints to reduce cross-letter matches
 * - Secondary curl tolerances for natural hand variation
 * - Direction constraints on all fingers (not just primary ones)
 * - Higher weights on discriminating features, lower on shared ones
 */

import fp from 'fingerpose';

const { Finger, FingerCurl, FingerDirection, GestureDescription } = fp;

function createGesture(name) {
  return new GestureDescription(name);
}

// ===== A =====
// Fist with thumb alongside (thumb up beside index, NOT over fingers like S)
const aGesture = createGesture('A');
aGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
aGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.3);
aGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 0.9);
aGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.6);
aGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.6);
aGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.4);
aGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.3);
aGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
aGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);
// Fingers should point forward/up (fist orientation)
aGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.4);
aGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.3);
aGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.3);

// ===== B =====
// Flat hand, fingers up, thumb tucked across palm (NOT spread like Hello)
const bGesture = createGesture('B');
bGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
bGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.7);
bGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.0); // Thumb MUST be curled for B
bGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
bGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.9);
bGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.4);
bGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.4);
bGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
bGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.9);
bGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.3);
bGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.3);
bGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
bGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.9);
bGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
bGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.9);

// ===== C =====
// Curved hand like holding a ball — all fingers half-curled in same direction
const cGesture = createGesture('C');
cGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.6);
cGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
cGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.5);
cGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.5);
cGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.4);
cGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.4);
cGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 0.3);
cGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.5);
cGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.5);
cGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.5);
cGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 0.3);
cGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 0.4);
cGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 0.4);

// ===== D =====
// Index up, thumb touches middle finger tip forming a circle below
const dGesture = createGesture('D');
dGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
dGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.4);
dGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.3);
dGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
dGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
dGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.4);
dGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.4);
dGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
dGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.5);
dGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
dGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.4);
dGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
dGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.4);

// ===== E =====
// All fingers curled tightly, thumb across curled fingers (below them)
const eGesture = createGesture('E');
eGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
eGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.6);
eGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.6);
eGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.6);
eGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.6);
eGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.6);

// ===== F =====
// Thumb and index form circle (both half-curled touching), other 3 fingers up
const fGesture = createGesture('F');
fGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.4);
fGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.8);
fGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.9);
fGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.3);
fGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.3);
fGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.9);
fGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
fGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.9);

// ===== G =====
// Index pointing to the side horizontally, thumb also out to side
// Key: HORIZONTAL orientation (vs D which is vertical)
const gGesture = createGesture('G');
gGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.9);
gGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.3);
gGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.7);
gGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.7);
gGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.4);
gGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.4);
gGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
gGesture.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 0.8);
gGesture.addDirection(Finger.Index, FingerDirection.HorizontalRight, 0.8);
gGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.3);
gGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.3);
gGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
gGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.4);
gGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
gGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
gGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
gGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== H =====
// Index and middle pointing to the side horizontally
// Key: HORIZONTAL orientation (vs U/V which are vertical)
const hGesture = createGesture('H');
hGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.7);
hGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);
hGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.2);
hGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
hGesture.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 0.8);
hGesture.addDirection(Finger.Index, FingerDirection.HorizontalRight, 0.8);
hGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.3);
hGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.3);
hGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
hGesture.addDirection(Finger.Middle, FingerDirection.HorizontalLeft, 0.8);
hGesture.addDirection(Finger.Middle, FingerDirection.HorizontalRight, 0.8);
hGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.3);
hGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.3);
hGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
hGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
hGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
hGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== I =====
// Pinky up, all others curled tightly including thumb
const iGesture = createGesture('I');
iGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.6);
iGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.0); // Thumb must NOT be extended (vs Y)
iGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.3);
iGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.3);
iGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
iGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
iGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.9);
iGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 0.4);
iGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 0.4);

// ===== K =====
// Index and middle up in V shape, thumb wedged between them touching middle
// Key: thumb is extended and between the two fingers (vs V where thumb is curled)
const kGesture = createGesture('K');
kGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.9);
kGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.4);
kGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 0.4);
kGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.5);
kGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.5);
kGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
kGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.6);
kGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.5);
kGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.5);
kGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
kGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.6);
kGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.4);
kGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.4);
kGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
kGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
kGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
kGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== L =====
// L shape: thumb out horizontal, index up vertical — right angle
const lGesture = createGesture('L');
lGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
lGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.7);
lGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.7);
lGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.4);
lGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.4);
lGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
lGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
lGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.3);
lGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.3);
lGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
lGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.3);
lGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
lGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
lGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
lGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== M =====
// Fist with 3 fingers (index, middle, ring) over thumb, pointing down
// Key: three fingers drape over thumb vs N which has two
const mGesture = createGesture('M');
mGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
mGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
mGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
mGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.5);
mGesture.addDirection(Finger.Index, FingerDirection.VerticalDown, 0.6);
mGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 0.4);
mGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 0.4);
mGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
mGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.5);
mGesture.addDirection(Finger.Middle, FingerDirection.VerticalDown, 0.5);
mGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
mGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.5);
mGesture.addDirection(Finger.Ring, FingerDirection.VerticalDown, 0.5);
mGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 0.9);
mGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.4);

// ===== N =====
// Fist with 2 fingers (index, middle) over thumb, pointing down
// Key: two fingers drape over thumb (pinky and ring fully curled)
const nGesture = createGesture('N');
nGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
nGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
nGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
nGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.5);
nGesture.addDirection(Finger.Index, FingerDirection.VerticalDown, 0.6);
nGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 0.4);
nGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 0.4);
nGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
nGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.5);
nGesture.addDirection(Finger.Middle, FingerDirection.VerticalDown, 0.5);
nGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
nGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
nGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
nGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== O =====
// All fingers curved to form O shape — tips close to thumb
const oGesture = createGesture('O');
oGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
oGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.4);
oGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 0.5);
oGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 0.5);
oGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 0.5);
oGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 0.5);

// ===== P =====
// Like K but pointing down — index and middle down, thumb out
const pGesture = createGesture('P');
pGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.8);
pGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.4);
pGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalDownLeft, 0.4);
pGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalDownRight, 0.4);
pGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.4);
pGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.4);
pGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
pGesture.addDirection(Finger.Index, FingerDirection.VerticalDown, 0.7);
pGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 0.5);
pGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 0.5);
pGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
pGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.4);
pGesture.addDirection(Finger.Middle, FingerDirection.VerticalDown, 0.6);
pGesture.addDirection(Finger.Middle, FingerDirection.DiagonalDownLeft, 0.4);
pGesture.addDirection(Finger.Middle, FingerDirection.DiagonalDownRight, 0.4);
pGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
pGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
pGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
pGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== Q =====
// Like G but pointing down — thumb and index down
const qGesture = createGesture('Q');
qGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.8);
qGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.3);
qGesture.addDirection(Finger.Thumb, FingerDirection.VerticalDown, 0.7);
qGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalDownLeft, 0.5);
qGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalDownRight, 0.5);
qGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
qGesture.addDirection(Finger.Index, FingerDirection.VerticalDown, 0.7);
qGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 0.5);
qGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 0.5);
qGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
qGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.3);
qGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
qGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
qGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
qGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== R =====
// Index and middle crossed (tips touching/overlapping), pointing up
const rGesture = createGesture('R');
rGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.7);
rGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);
rGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.2);
rGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
rGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.9);
rGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.3);
rGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.3);
rGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
rGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.9);
rGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.3);
rGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.3);
rGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
rGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
rGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
rGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== S =====
// Fist with thumb over curled fingers (in front of/crossing them)
const sGesture = createGesture('S');
sGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
sGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);
sGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.2);
sGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.4);
aGesture.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 0.3);
aGesture.addDirection(Finger.Index, FingerDirection.HorizontalRight, 0.3);
sGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.4);
sGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.4);
sGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.4);

// ===== T =====
// Fist with thumb tucked between index and middle fingers
const tGesture = createGesture('T');
tGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
tGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);
tGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
tGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.5);
tGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
tGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.4);
tGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
tGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
tGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
tGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== U =====
// Index and middle up TOGETHER (parallel, close), thumb tucked
// Key: fingers TOGETHER (vs V which is spread)
const uGesture = createGesture('U');
uGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.8);
uGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
uGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.1);
uGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
uGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
uGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.3);
uGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.3);
uGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
uGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
uGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.3);
uGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.3);
uGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
uGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
uGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
uGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== V =====
// Peace sign / V shape — index and middle SPREAD apart, pointing up
// Key: fingers SPREAD (vs U which is together)
const vGesture = createGesture('V');
vGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.8);
vGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
vGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.1);
vGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
vGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.6);
vGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.6);
vGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.6);
vGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
vGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.6);
vGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.6);
vGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.6);
vGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
vGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
vGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
vGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== W =====
// Three fingers up (index, middle, ring), thumb and pinky curled
const wGesture = createGesture('W');
wGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.8);
wGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
wGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.1);
wGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
wGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.8);
wGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.4);
wGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.4);
wGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
wGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.8);
wGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.3);
wGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.3);
wGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
wGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.8);
wGesture.addDirection(Finger.Ring, FingerDirection.DiagonalUpLeft, 0.3);
wGesture.addDirection(Finger.Ring, FingerDirection.DiagonalUpRight, 0.3);
wGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
wGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.3);

// ===== X =====
// Index finger bent at hook shape (half-curled), all others fully curled
const xGesture = createGesture('X');
xGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.7);
xGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);
xGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
xGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 0.1); // Must NOT be straight (vs D)
xGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 0.3);
xGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.5);
xGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.4);
xGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.4);
xGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
xGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.3);
xGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
xGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.2);
xGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
xGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.2);

// ===== Y =====
// Thumb and pinky out (hang loose / shaka), other 3 curled
// Key: thumb MUST be extended (vs I where only pinky is up)
const yGesture = createGesture('Y');
yGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
yGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.2);
yGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.6);
yGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.6);
yGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.5);
yGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.5);
yGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
yGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.3);
yGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
yGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.3);
yGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
yGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.3);
yGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
yGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.6);
yGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 0.5);
yGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 0.5);


export const alphabetGestures = [
  aGesture, bGesture, cGesture, dGesture, eGesture,
  fGesture, gGesture, hGesture, iGesture,
  // J requires motion (detected by trajectoryTracker)
  kGesture, lGesture, mGesture, nGesture, oGesture,
  pGesture, qGesture, rGesture, sGesture, tGesture,
  uGesture, vGesture, wGesture, xGesture, yGesture,
  // Z requires motion (detected by trajectoryTracker)
];

// Quick reference data for UI
export const alphabetReference = [
  { letter: 'A', desc: 'Fist, thumb up' },
  { letter: 'B', desc: 'Flat hand up' },
  { letter: 'C', desc: 'Curved hand' },
  { letter: 'D', desc: 'Index up' },
  { letter: 'E', desc: 'All curled' },
  { letter: 'F', desc: 'OK + 3 up' },
  { letter: 'G', desc: 'Point side' },
  { letter: 'H', desc: '2 point side' },
  { letter: 'I', desc: 'Pinky up' },
  { letter: 'J', desc: '⚡ Trace J' },
  { letter: 'K', desc: 'V + thumb' },
  { letter: 'L', desc: 'L shape' },
  { letter: 'M', desc: 'Fist down' },
  { letter: 'N', desc: 'Fist down' },
  { letter: 'O', desc: 'O shape' },
  { letter: 'P', desc: 'K down' },
  { letter: 'Q', desc: 'G down' },
  { letter: 'R', desc: 'Cross fingers' },
  { letter: 'S', desc: 'Fist tight' },
  { letter: 'T', desc: 'Thumb in' },
  { letter: 'U', desc: '2 fingers up' },
  { letter: 'V', desc: 'Peace sign' },
  { letter: 'W', desc: '3 fingers up' },
  { letter: 'X', desc: 'Hook finger' },
  { letter: 'Y', desc: 'Hang loose' },
  { letter: 'Z', desc: '⚡ Trace Z' },
];
