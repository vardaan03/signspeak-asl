/**
 * SignSpeak — Main Application Module
 * 
 * Wires together: camera → hand detection → gesture recognition → UI
 * Includes auto-mirror detection and text-to-speech
 */

import { initHandDetector, detectHands } from './handDetector.js';
import { recognizeGesture, canAcceptGesture, markAccepted, resetBuffer, getHoldProgress, getSigningRegion } from './gestureRecognizer.js';
import { drawLandmarks, drawSigningRegion } from './canvasOverlay.js';
import { feedMirrorSample, getMirrorState } from './mirrorDetector.js';
import {
  initPerformanceMonitor,
  frameStart,
  frameEnd,
  shouldSkipDetection,
} from './performanceMonitor.js';
import {
  initUI,
  showApp,
  showError,
  updateLoadingText,
  updateHandStatus,
  updateMirrorStatus,
  updateDetectedSign,
  updateHoldProgress,
  updateSentence,
  updateCandidates,
  flashLetterAdded,
  getButtons,
  updatePerformance,
  addToHistory,
} from './ui.js';

// --- State ---
let sentence = '';
let videoElement = null;
let canvasElement = null;
let canvasCtx = null;
let isRunning = false;
let mirrorApplied = false;

// --- Initialization ---
async function init() {
  try {
    // 1. Init UI
    initUI();

    // Init performance monitor
    initPerformanceMonitor({
      onFpsUpdate: (metrics) => updatePerformance(metrics),
      onPerformanceAlert: (alert) => {
        console.warn('Performance alert:', alert.message);
      },
    });

    // 2. Request camera access
    updateLoadingText('Requesting camera access...');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
      },
      audio: false,
    });

    videoElement = document.getElementById('webcam');
    canvasElement = document.getElementById('landmark-canvas');
    canvasCtx = canvasElement.getContext('2d');

    videoElement.srcObject = stream;
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        // Set canvas size to match video
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        resolve();
      };
    });
    await videoElement.play();

    // 3. Init hand detector
    updateLoadingText('Loading AI hand detection model...');
    await initHandDetector();

    // 4. Wire up controls
    setupControls();

    // 5. Show app and start detection loop
    showApp();
    isRunning = true;
    requestAnimationFrame(detectionLoop);

  } catch (err) {
    console.error('Initialization error:', err);
    let message = 'Failed to initialize the application.';

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      message = 'Camera access was denied. Please allow camera access and reload the page.';
    } else if (err.name === 'NotFoundError') {
      message = 'No camera found. Please connect a webcam and reload the page.';
    } else if (err.name === 'NotReadableError') {
      message = 'Camera is in use by another application. Please close it and try again.';
    } else {
      message = `Initialization failed: ${err.message}`;
    }

    showError(message, () => {
      window.location.reload();
    });
  }
}

// --- Detection Loop ---
function detectionLoop(timestamp) {
  if (!isRunning) return;

  if (videoElement.readyState >= 2) {
    const perfStart = frameStart();

    // Adaptive frame skipping: skip detection on alternate frames if latency is high
    const skipDetection = shouldSkipDetection();

    if (!skipDetection) {
    // 1. Detect hands
    const detection = detectHands(videoElement, timestamp);

    if (detection) {
      const { landmarks, handedness, hands, face } = detection;

      // 2. Auto-mirror detection (first few frames)
      const mirrorState = getMirrorState();
      if (!mirrorState.decided) {
        const result = feedMirrorSample(handedness, landmarks);
        if (result.decided) {
          applyMirror(result.mirrored);
        }
        updateMirrorStatus(result.decided, result.mirrored);
      }

      // 3. Draw landmarks for all detected hands
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Draw signing region box
      const region = getSigningRegion();
      const gesture = recognizeGesture(landmarks, face);
      drawSigningRegion(canvasCtx, region, canvasElement.width, canvasElement.height, gesture.inRegion);

      // Draw all hands
      for (const hand of hands) {
        drawLandmarks(canvasCtx, hand.landmarks, canvasElement.width, canvasElement.height);
      }

      // 4. Update hand status (show count)
      updateHandStatus(true, hands.length);

      if (gesture.name) {
        updateDetectedSign(gesture.name, gesture.confidence, gesture.stable);
        updateHoldProgress(gesture.holdProgress, gesture.stable);
        updateCandidates(gesture.raw);

        // 6. If hold timer completed, add to sentence
        if (gesture.holdReady && canAcceptGesture(gesture.name)) {
          addToSentence(gesture.name);
          markAccepted(gesture.name);
          addToHistory(gesture.name);
        }
      } else {
        updateDetectedSign(null, 0, false);
        updateHoldProgress(0, false);
        updateCandidates([]);
      }

    } else {
      // No hand detected
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Draw region box even with no hand
      const region = getSigningRegion();
      drawSigningRegion(canvasCtx, region, canvasElement.width, canvasElement.height, true);

      updateHandStatus(false, 0);

      // Still feed null to gesture recognizer for buffer decay
      recognizeGesture(null, null);
      updateDetectedSign(null, 0, false);
      updateHoldProgress(0, false);
      updateCandidates([]);
    }
    } // end !skipDetection

    frameEnd(perfStart);
  }

  requestAnimationFrame(detectionLoop);
}

// --- Mirror Application ---
function applyMirror(mirrored) {
  if (mirrorApplied) return;
  mirrorApplied = true;

  if (mirrored) {
    videoElement.classList.add('mirrored');
    canvasElement.classList.add('mirrored');
  } else {
    videoElement.classList.remove('mirrored');
    canvasElement.classList.remove('mirrored');
  }
}

// --- Sentence Building ---
function addToSentence(gestureName) {
  // For single-letter alphabet gestures, add the letter
  if (gestureName.length === 1) {
    sentence += gestureName;
  } else {
    // For common signs with emoji prefix, extract the word
    // Format is like "👍 Yes" or "🖐 Hello"
    const parts = gestureName.split(' ');
    const word = parts.length > 1 ? parts.slice(1).join(' ') : gestureName;

    // Add space before word if sentence doesn't end with space
    if (sentence.length > 0 && !sentence.endsWith(' ')) {
      sentence += ' ';
    }
    sentence += word + ' ';
  }

  // Flash animation
  const displayChar = gestureName.length === 1 ? gestureName : gestureName.split(' ')[0];
  flashLetterAdded(displayChar);

  updateSentence(sentence);
}

// --- Controls ---
function setupControls() {
  const buttons = getButtons();

  buttons.space.addEventListener('click', () => {
    sentence += ' ';
    updateSentence(sentence);
  });

  buttons.backspace.addEventListener('click', () => {
    if (sentence.length > 0) {
      sentence = sentence.slice(0, -1);
      updateSentence(sentence);
    }
  });

  buttons.clear.addEventListener('click', () => {
    sentence = '';
    resetBuffer();
    updateSentence(sentence);
  });

  buttons.speak.addEventListener('click', () => {
    speakSentence();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target === document.body) {
      e.preventDefault();
      sentence += ' ';
      updateSentence(sentence);
    } else if (e.key === 'Backspace' && e.target === document.body) {
      e.preventDefault();
      sentence = sentence.slice(0, -1);
      updateSentence(sentence);
    } else if (e.key === 'Escape') {
      sentence = '';
      resetBuffer();
      updateSentence(sentence);
    } else if (e.key === 'Enter' && e.target === document.body) {
      e.preventDefault();
      speakSentence();
    }
  });
}

// --- Text-to-Speech ---
function speakSentence() {
  if (!sentence.trim()) return;
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(sentence.trim());
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to find a good English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(
    (v) => v.lang.startsWith('en') && v.name.includes('Google')
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// --- Load voices (some browsers need this) ---
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Voices loaded
  };
}

// --- Start the app ---
document.addEventListener('DOMContentLoaded', init);
