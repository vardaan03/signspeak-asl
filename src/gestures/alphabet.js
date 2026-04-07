/**
 * ASL Alphabet Gesture Definitions
 * Defines Fingerpose gesture descriptions for ASL fingerspelling (A-Y)
 * 
 * Each letter is defined by finger curl and direction rules.
 * J and Z are motion-based and cannot be detected statically.
 *
 * Fingerpose finger reference:
 *   0 = Thumb, 1 = Index, 2 = Middle, 3 = Ring, 4 = Pinky
 * 
 * Curl states: NoCurl, HalfCurl, FullCurl
 * Directions: VerticalUp, VerticalDown, HorizontalLeft, HorizontalRight,
 *             DiagonalUpLeft, DiagonalUpRight, DiagonalDownLeft, DiagonalDownRight
 */

import fp from 'fingerpose';

const { Finger, FingerCurl, FingerDirection, GestureDescription } = fp;

// Helper to quickly define a gesture
function createGesture(name) {
  return new GestureDescription(name);
}

// ===== A =====
// Fist with thumb alongside (thumb up, all fingers curled)
const aGesture = createGesture('A');
aGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
aGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 0.7);
aGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.5);
aGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.5);
aGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== B =====
// Flat hand, fingers up, thumb across palm
const bGesture = createGesture('B');
bGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.8);
bGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.6);
bGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
bGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.7);
bGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
bGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.7);
bGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
bGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.7);
bGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
bGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.7);

// ===== C =====
// Curved hand like holding a ball
const cGesture = createGesture('C');
cGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.8);
cGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
cGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);

// ===== D =====
// Index up, other fingers curled with thumb touching middle finger
const dGesture = createGesture('D');
dGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.7);
dGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);
dGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
dGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.8);
dGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
dGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
dGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== E =====
// All fingers curled, thumb across fingers
const eGesture = createGesture('E');
eGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
eGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== F =====
// OK sign with thumb and index touching, other fingers up
const fGesture = createGesture('F');
fGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
fGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.7);
fGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.7);
fGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
fGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.7);

// ===== G =====
// Index pointing to the side, thumb out
const gGesture = createGesture('G');
gGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.8);
gGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.6);
gGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.6);
gGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
gGesture.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 0.6);
gGesture.addDirection(Finger.Index, FingerDirection.HorizontalRight, 0.6);
gGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
gGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
gGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== H =====
// Index and middle pointing to the side
const hGesture = createGesture('H');
hGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.6);
hGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);
hGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
hGesture.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 0.6);
hGesture.addDirection(Finger.Index, FingerDirection.HorizontalRight, 0.6);
hGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
hGesture.addDirection(Finger.Middle, FingerDirection.HorizontalLeft, 0.6);
hGesture.addDirection(Finger.Middle, FingerDirection.HorizontalRight, 0.6);
hGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
hGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== I =====
// Pinky up, all others curled
const iGesture = createGesture('I');
iGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.8);
iGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
iGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
iGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.8);

// ===== K =====
// Index and middle up in V shape, thumb between them
const kGesture = createGesture('K');
kGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.7);
kGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
kGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.5);
kGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.5);
kGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.5);
kGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
kGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.5);
kGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
kGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== L =====
// L shape: thumb and index out at right angle
const lGesture = createGesture('L');
lGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
lGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.6);
lGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.6);
lGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.4);
lGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.4);
lGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
lGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.8);
lGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
lGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
lGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== M =====
// Fist with thumb under index, middle, ring fingers
const mGesture = createGesture('M');
mGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
mGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
mGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
mGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
mGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 0.8);
mGesture.addDirection(Finger.Index, FingerDirection.VerticalDown, 0.5);
mGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 0.4);
mGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 0.4);

// ===== N =====
// Similar to M but thumb between index and middle
const nGesture = createGesture('N');
nGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
nGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
nGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
nGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
nGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
nGesture.addDirection(Finger.Index, FingerDirection.VerticalDown, 0.5);

// ===== O =====
// All fingers curved to form O shape
const oGesture = createGesture('O');
oGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
oGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.4);
oGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.9);
oGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.9);

// ===== P =====
// Like K but pointing down
const pGesture = createGesture('P');
pGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.7);
pGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
pGesture.addDirection(Finger.Index, FingerDirection.VerticalDown, 0.5);
pGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 0.5);
pGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 0.5);
pGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
pGesture.addDirection(Finger.Middle, FingerDirection.VerticalDown, 0.5);
pGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
pGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== Q =====
// Like G but pointing down
const qGesture = createGesture('Q');
qGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.7);
qGesture.addDirection(Finger.Thumb, FingerDirection.VerticalDown, 0.5);
qGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalDownLeft, 0.5);
qGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalDownRight, 0.5);
qGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
qGesture.addDirection(Finger.Index, FingerDirection.VerticalDown, 0.5);
qGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 0.4);
qGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 0.4);
qGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
qGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
qGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== R =====
// Index and middle crossed
const rGesture = createGesture('R');
rGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.6);
rGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);
rGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
rGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.8);
rGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
rGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.8);
rGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
rGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== S =====
// Fist with thumb over fingers
const sGesture = createGesture('S');
sGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
sGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.4);
sGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== T =====
// Fist with thumb between index and middle
const tGesture = createGesture('T');
tGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
tGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
tGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
tGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
tGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== U =====
// Index and middle up together
const uGesture = createGesture('U');
uGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.7);
uGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
uGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
uGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.8);
uGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
uGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.8);
uGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
uGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== V =====
// Peace sign / V shape
const vGesture = createGesture('V');
vGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.7);
vGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
vGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
vGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.5);
vGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.5);
vGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.5);
vGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
vGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.5);
vGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.5);
vGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.5);
vGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
vGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== W =====
// Three fingers up (index, middle, ring)
const wGesture = createGesture('W');
wGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.7);
wGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
wGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
wGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.7);
wGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
wGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.7);
wGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
wGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.7);
wGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== X =====
// Index finger bent at hook shape
const xGesture = createGesture('X');
xGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.6);
xGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);
xGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
xGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.6);
xGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
xGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
xGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ===== Y =====
// Thumb and pinky out (hang loose / shaka)
const yGesture = createGesture('Y');
yGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
yGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.5);
yGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.5);
yGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.4);
yGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.4);
yGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
yGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
yGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
yGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
yGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.5);
yGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 0.5);
yGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 0.5);


export const alphabetGestures = [
  aGesture, bGesture, cGesture, dGesture, eGesture,
  fGesture, gGesture, hGesture, iGesture,
  // J requires motion (not supported in static recognition)
  kGesture, lGesture, mGesture, nGesture, oGesture,
  pGesture, qGesture, rGesture, sGesture, tGesture,
  uGesture, vGesture, wGesture, xGesture, yGesture,
  // Z requires motion (not supported in static recognition)
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
