/**
 * Hand & Face Detection Module
 * Uses MediaPipe Hand Landmarker for hands and FaceLandmarker for face
 * to enable body-relative gesture detection (chin, forehead, etc.)
 */

import { FilesetResolver, HandLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision';

let handLandmarker = null;
let faceLandmarker = null;
let lastTimestamp = -1;
let lastFaceTimestamp = -1;
let cachedFace = null;
const FACE_DETECT_INTERVAL = 3; // Run face detection every N frames
let frameCounter = 0;

/**
 * Initialize the MediaPipe Hand and Face Landmarkers
 */
export async function initHandDetector() {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  // Init hand landmarker
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  // Init face landmarker (lightweight — just need chin/forehead positions)
  try {
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });
  } catch (e) {
    console.warn('Face detection not available, body-relative gestures disabled:', e.message);
    faceLandmarker = null;
  }

  return handLandmarker;
}

/**
 * Key face landmark indices (MediaPipe Face Mesh has 478 landmarks)
 */
const FACE_POINTS = {
  chin: 152,
  forehead: 10,
  noseTip: 1,
  leftCheek: 234,
  rightCheek: 454,
  upperLip: 13,
  lowerLip: 14,
};

/**
 * Detect hands and face in a video frame
 */
export function detectHands(videoElement, timestamp) {
  if (!handLandmarker) return null;

  // MediaPipe requires strictly increasing timestamps
  if (timestamp <= lastTimestamp) {
    timestamp = lastTimestamp + 1;
  }
  lastTimestamp = timestamp;
  frameCounter++;

  try {
    const result = handLandmarker.detectForVideo(videoElement, timestamp);

    // Run face detection less frequently to save perf
    if (faceLandmarker && frameCounter % FACE_DETECT_INTERVAL === 0) {
      const faceTs = timestamp + 0.5; // Slightly offset to avoid collision
      if (faceTs > lastFaceTimestamp) {
        lastFaceTimestamp = faceTs;
        try {
          const faceResult = faceLandmarker.detectForVideo(videoElement, faceTs);
          if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
            const fl = faceResult.faceLandmarks[0];
            cachedFace = {
              chin: fl[FACE_POINTS.chin],
              forehead: fl[FACE_POINTS.forehead],
              noseTip: fl[FACE_POINTS.noseTip],
              upperLip: fl[FACE_POINTS.upperLip],
              leftCheek: fl[FACE_POINTS.leftCheek],
              rightCheek: fl[FACE_POINTS.rightCheek],
            };
          }
        } catch (e) {
          // Face detection frame skip — non-fatal
        }
      }
    }

    if (result.landmarks && result.landmarks.length > 0) {
      const hands = [];
      for (let i = 0; i < result.landmarks.length; i++) {
        hands.push({
          landmarks: result.landmarks[i],
          handedness: result.handednesses?.[i]?.[0] || null,
        });
      }
      return {
        hands,
        landmarks: result.landmarks[0],
        handedness: result.handednesses?.[0]?.[0] || null,
        face: cachedFace,
      };
    }
  } catch (e) {
    console.warn('Hand detection error:', e);
  }

  return null;
}

/**
 * Check if the hand detector is ready
 */
export function isDetectorReady() {
  return handLandmarker !== null;
}
