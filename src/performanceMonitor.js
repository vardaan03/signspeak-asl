/**
 * Performance Monitor — FPS, Latency, and Adaptive Quality
 *
 * Tracks real-time performance metrics and provides:
 * - FPS counter (rolling average)
 * - Per-frame inference latency
 * - Adaptive frame skipping recommendation
 * - Performance degradation alerts
 */

const FPS_HISTORY_SIZE = 30;   // Frames to average over
const ALERT_FPS_THRESHOLD = 15; // Alert below this FPS
const HIGH_LATENCY_MS = 50;    // Consider >50ms as high latency

let fpsHistory = [];
let lastFrameTime = 0;
let frameCount = 0;
let totalInferenceTime = 0;
let inferenceCount = 0;
let lastInferenceMs = 0;
let isLowPerformance = false;

// Callbacks
let onFpsUpdate = null;
let onPerformanceAlert = null;

/**
 * Initialize the performance monitor with callbacks
 */
export function initPerformanceMonitor(options = {}) {
  onFpsUpdate = options.onFpsUpdate || null;
  onPerformanceAlert = options.onPerformanceAlert || null;
  fpsHistory = [];
  lastFrameTime = 0;
  frameCount = 0;
  totalInferenceTime = 0;
  inferenceCount = 0;
  isLowPerformance = false;
}

/**
 * Call at the start of each detection loop frame
 */
export function frameStart() {
  const now = performance.now();
  if (lastFrameTime > 0) {
    const deltaMs = now - lastFrameTime;
    const fps = 1000 / deltaMs;

    fpsHistory.push(fps);
    if (fpsHistory.length > FPS_HISTORY_SIZE) fpsHistory.shift();
  }
  lastFrameTime = now;
  frameCount++;

  return now; // Return for latency measurement
}

/**
 * Call after detection + recognition completes
 */
export function frameEnd(startTime) {
  const elapsed = performance.now() - startTime;
  lastInferenceMs = elapsed;
  totalInferenceTime += elapsed;
  inferenceCount++;

  // Update FPS display every ~10 frames
  if (frameCount % 10 === 0 && onFpsUpdate) {
    onFpsUpdate(getMetrics());
  }

  // Performance alert check
  const avgFps = getAverageFPS();
  if (avgFps > 0 && avgFps < ALERT_FPS_THRESHOLD && !isLowPerformance) {
    isLowPerformance = true;
    if (onPerformanceAlert) {
      onPerformanceAlert({
        type: 'low_fps',
        fps: avgFps,
        message: `Performance degraded (${avgFps.toFixed(0)} FPS). Try reducing camera resolution.`,
      });
    }
  } else if (avgFps >= ALERT_FPS_THRESHOLD + 5) {
    isLowPerformance = false;
  }
}

/**
 * Get current rolling average FPS
 */
export function getAverageFPS() {
  if (fpsHistory.length === 0) return 0;
  const sum = fpsHistory.reduce((a, b) => a + b, 0);
  return sum / fpsHistory.length;
}

/**
 * Get comprehensive metrics snapshot
 */
export function getMetrics() {
  const avgFps = getAverageFPS();
  const avgLatency = inferenceCount > 0 ? totalInferenceTime / inferenceCount : 0;

  return {
    fps: avgFps,
    fpsDisplay: avgFps > 0 ? `${avgFps.toFixed(0)}` : '--',
    latency: lastInferenceMs,
    latencyDisplay: lastInferenceMs > 0 ? `${lastInferenceMs.toFixed(0)}ms` : '--',
    avgLatency,
    totalFrames: frameCount,
    isLowPerformance,
    shouldSkipFrame: lastInferenceMs > HIGH_LATENCY_MS,
  };
}

/**
 * Check if the current frame should be skipped for detection
 * (still render, but skip the expensive inference)
 */
export function shouldSkipDetection() {
  // Skip every other frame if latency is high
  if (lastInferenceMs > HIGH_LATENCY_MS) {
    return frameCount % 2 !== 0;
  }
  return false;
}

/**
 * Reset all metrics (e.g., on settings change)
 */
export function resetMetrics() {
  fpsHistory = [];
  lastFrameTime = 0;
  frameCount = 0;
  totalInferenceTime = 0;
  inferenceCount = 0;
  lastInferenceMs = 0;
  isLowPerformance = false;
}
