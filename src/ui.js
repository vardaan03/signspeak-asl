/**
 * UI Module — Simplified
 * Handles DOM updates, animations, hold-progress, and the side menu
 * with custom SVG hand avatars instead of PNG images.
 */

import { alphabetReference } from './gestures/alphabet.js';
import { commonSignsReference } from './gestures/commonSigns.js';
import { customSignsReference } from './gestures/landmarkAnalyzer.js';
import { numberReference } from './gestures/numberSigns.js';

// DOM references
let els = {};

export function initUI() {
  els = {
    loadingOverlay: document.getElementById('loading-overlay'),
    errorOverlay: document.getElementById('error-overlay'),
    errorMessage: document.getElementById('error-message'),
    errorRetryBtn: document.getElementById('error-retry-btn'),
    app: document.getElementById('app'),
    handStatus: document.getElementById('hand-status'),
    mirrorIcon: document.getElementById('mirror-icon'),
    mirrorText: document.getElementById('mirror-text'),
    detectedLetter: document.getElementById('detected-letter'),
    holdRing: document.getElementById('hold-ring-progress'),
    holdLabel: document.getElementById('hold-label'),
    confidenceText: document.getElementById('confidence-text'),
    confidenceBar: document.getElementById('confidence-bar'),
    sentenceDisplay: document.getElementById('sentence-display'),
    btnSpace: document.getElementById('btn-space'),
    btnBackspace: document.getElementById('btn-backspace'),
    btnClear: document.getElementById('btn-clear'),
    btnSpeak: document.getElementById('btn-speak'),
    btnToggleRef: document.getElementById('btn-toggle-ref'),
    referenceGrid: document.getElementById('reference-grid'),
    candidatesDisplay: document.getElementById('candidates-display'),
    sideMenuToggle: document.getElementById('side-menu-toggle'),
    sideMenuOverlay: document.getElementById('side-menu-overlay'),
    sideMenuPanel: document.getElementById('side-menu-panel'),
    sideMenuClose: document.getElementById('side-menu-close'),
    sideMenuContent: document.getElementById('side-menu-content'),
    sideMenuSearch: document.getElementById('side-menu-search'),
  };

  // Build dynamic elements
  buildPerformanceOverlay();
  buildHistoryBar();

  buildReferenceGrid();
  buildSideMenu();

  els.btnToggleRef.addEventListener('click', () => {
    els.referenceGrid.classList.toggle('collapsed');
    const isCollapsed = els.referenceGrid.classList.contains('collapsed');
    els.btnToggleRef.innerHTML = isCollapsed ? '&darr;' : '&uarr;';
  });

  els.sideMenuToggle.addEventListener('click', openSideMenu);
  els.sideMenuClose.addEventListener('click', closeSideMenu);
  els.sideMenuOverlay.addEventListener('click', closeSideMenu);

  els.sideMenuSearch.addEventListener('input', (e) => {
    filterSideMenu(e.target.value);
  });

  return els;
}

function buildReferenceGrid() {
  const allRef = [...alphabetReference, ...commonSignsReference];
  els.referenceGrid.innerHTML = allRef
    .map((item) => `
    <div class="ref-item" data-letter="${item.letter}" id="ref-${item.letter}">
      <span class="ref-letter">${item.letter}</span>
      <span class="ref-desc">${item.desc}</span>
    </div>
  `).join('');
}

function buildSideMenu() {
  let html = '';

  // --- Alphabet ---
  html += `
    <div class="side-menu-section">
      <h3 class="side-menu-section-title">Alphabet (A-Z)</h3>
      <p class="side-menu-section-subtitle">Fingerspelling \u2014 hold each sign for detection</p>
      <div class="side-menu-image-gallery">
        <img src="/signs/asl_alphabet_am.png" alt="ASL Alphabet A through M" class="side-menu-chart-img" loading="lazy" />
        <img src="/signs/asl_alphabet_nz.png" alt="ASL Alphabet N through Z" class="side-menu-chart-img" loading="lazy" />
      </div>
      <div class="side-menu-grid">
  `;

  for (const item of alphabetReference) {
    const isMotion = item.desc.includes('Trace');
    const badge = isMotion
      ? '<span class="side-badge badge-motion">MOTION</span>'
      : '<span class="side-badge badge-static">STATIC</span>';
    const cardClass = isMotion ? 'side-menu-card motion-sign' : 'side-menu-card';

    html += `
      <div class="${cardClass}" data-search="${item.letter} ${item.desc}">
        <div class="side-menu-card-letter">${item.letter}</div>
        <div class="side-menu-card-info">
          <span class="side-menu-card-name">${item.letter}</span>
          <span class="side-menu-card-desc">${item.desc}</span>
          ${badge}
        </div>
      </div>
    `;
  }

  html += `</div></div>`;

  // --- Common signs ---
  html += `
    <div class="side-menu-section">
      <h3 class="side-menu-section-title">Common Signs</h3>
      <p class="side-menu-section-subtitle">Basic gestures detected by finger position</p>
      <div class="side-menu-image-gallery">
        <img src="/signs/asl_common_signs.png" alt="Common ASL Signs Reference" class="side-menu-chart-img" loading="lazy" />
      </div>
      <div class="side-menu-grid">
  `;

  for (const item of commonSignsReference) {
    html += `
      <div class="side-menu-card" data-search="${item.letter} ${item.desc}">
        <div class="side-menu-card-letter">${item.letter}</div>
        <div class="side-menu-card-info">
          <span class="side-menu-card-name">${item.letter}</span>
          <span class="side-menu-card-desc">${item.desc}</span>
          <span class="side-badge badge-static">STATIC</span>
        </div>
      </div>
    `;
  }

  html += `</div></div>`;

  // --- Advanced gestures ---
  html += `
    <div class="side-menu-section">
      <h3 class="side-menu-section-title">Advanced Gestures</h3>
      <p class="side-menu-section-subtitle">Body-relative and 3D analysis gestures</p>
      <div class="side-menu-grid">
  `;

  for (const item of customSignsReference) {
    const isBody = item.bodyRelative;
    const isMotion = item.motion;
    const badge = isBody
      ? '<span class="side-badge badge-body">BODY</span>'
      : isMotion
        ? '<span class="side-badge badge-motion">MOTION</span>'
        : '<span class="side-badge badge-static">GESTURE</span>';
    const cardClass = isBody ? 'side-menu-card body-sign' : 'side-menu-card';

    html += `
      <div class="${cardClass}" data-search="${item.name} ${item.desc}">
        <div class="side-menu-card-letter">${item.letter}</div>
        <div class="side-menu-card-info">
          <span class="side-menu-card-name">${item.name}</span>
          <span class="side-menu-card-desc">${item.desc}</span>
          ${badge}
        </div>
      </div>
    `;
  }

  html += `</div></div>`;

  // --- Tips ---
  html += `
    <div class="side-menu-section side-menu-tips">
      <h3 class="side-menu-section-title">Tips</h3>
      <ul class="side-menu-tips-list">
        <li><span class="tip-dot"></span> Keep your hand inside the dashed signing region</li>
        <li><span class="tip-dot"></span> Hold signs steady for ~0.6s to confirm</li>
        <li><span class="tip-dot"></span> Good lighting improves accuracy significantly</li>
        <li><span class="tip-dot"></span> J and Z: trace the letter shape in the air</li>
        <li><span class="tip-dot"></span> Body signs (Thank You, Think, Eat) need your face visible</li>
        <li><span class="tip-dot"></span> Two hands are tracked \u2014 both show landmarks</li>
        <li><span class="tip-dot"></span> Top-3 candidates shown below detected sign</li>
      </ul>
    </div>
  `;

  els.sideMenuContent.innerHTML = html;
}

function filterSideMenu(query) {
  const q = query.toLowerCase().trim();
  const cards = els.sideMenuContent.querySelectorAll('.side-menu-card');
  cards.forEach((card) => {
    const searchText = (card.getAttribute('data-search') || '').toLowerCase();
    card.style.display = q === '' || searchText.includes(q) ? '' : 'none';
  });
}

function openSideMenu() {
  els.sideMenuOverlay.classList.add('active');
  els.sideMenuPanel.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSideMenu() {
  els.sideMenuOverlay.classList.remove('active');
  els.sideMenuPanel.classList.remove('active');
  document.body.style.overflow = '';
}

export function showApp() {
  els.loadingOverlay.classList.add('hidden');
  els.app.classList.remove('hidden');
}

export function showError(message, onRetry) {
  els.loadingOverlay.classList.add('hidden');
  els.app.classList.add('hidden');
  els.errorOverlay.classList.remove('hidden');
  els.errorMessage.textContent = message;

  if (onRetry) {
    els.errorRetryBtn.classList.remove('hidden');
    els.errorRetryBtn.onclick = onRetry;
  } else {
    els.errorRetryBtn.classList.add('hidden');
  }
}

export function updateLoadingText(text) {
  const loadingText = document.querySelector('.loading-text');
  if (loadingText) loadingText.textContent = text;
}

export function updateHandStatus(detected, handCount = 1) {
  if (detected) {
    els.handStatus.classList.remove('status-inactive');
    els.handStatus.classList.add('status-active');
    const label = handCount > 1 ? `${handCount} hands` : 'Hand OK';
    els.handStatus.querySelector('.status-text').textContent = label;
  } else {
    els.handStatus.classList.remove('status-active');
    els.handStatus.classList.add('status-inactive');
    els.handStatus.querySelector('.status-text').textContent = 'No hand';
  }
}

export function updateMirrorStatus(decided, mirrored) {
  if (!decided) {
    els.mirrorIcon.textContent = '~';
    els.mirrorText.textContent = 'Detecting...';
  } else if (mirrored) {
    els.mirrorIcon.textContent = 'M';
    els.mirrorText.textContent = 'Mirrored';
  } else {
    els.mirrorIcon.textContent = 'D';
    els.mirrorText.textContent = 'Direct';
  }
}

let currentDisplayedLetter = null;

export function updateDetectedSign(name, confidence, stable) {
  if (!name) {
    els.detectedLetter.textContent = '?';
    els.detectedLetter.classList.remove('glow');
    els.confidenceText.textContent = '--';
    els.confidenceBar.style.width = '0%';
    clearRefHighlight();
    currentDisplayedLetter = null;
    return;
  }

  const displayName = name;
  const confPercent = Math.min(100, (confidence / 10) * 100);

  if (displayName !== currentDisplayedLetter) {
    els.detectedLetter.textContent = displayName;
    els.detectedLetter.classList.remove('pop');
    void els.detectedLetter.offsetWidth;
    els.detectedLetter.classList.add('pop');
    currentDisplayedLetter = displayName;
    highlightRef(name.length === 1 ? name : null);
  }

  if (stable) {
    els.detectedLetter.classList.add('glow');
  } else {
    els.detectedLetter.classList.remove('glow');
  }

  els.confidenceText.textContent = `${confPercent.toFixed(0)}%`;
  els.confidenceBar.style.width = `${confPercent}%`;

  // Color-coded confidence
  if (confPercent < 40) {
    els.confidenceBar.style.background = 'var(--red, #ef4444)';
  } else if (confPercent < 70) {
    els.confidenceBar.style.background = 'var(--yellow, #f59e0b)';
  } else {
    els.confidenceBar.style.background = 'var(--green, #22c55e)';
  }
}

export function updateHoldProgress(progress, stable) {
  if (!els.holdRing) return;

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - progress * circumference;

  els.holdRing.style.strokeDasharray = `${circumference}`;
  els.holdRing.style.strokeDashoffset = `${offset}`;

  if (progress >= 1) {
    els.holdRing.style.stroke = 'var(--green)';
    els.holdLabel.textContent = 'Added';
    els.holdLabel.style.color = 'var(--green)';
  } else if (progress > 0) {
    els.holdRing.style.stroke = 'var(--cyan)';
    els.holdLabel.textContent = `${Math.round(progress * 100)}%`;
    els.holdLabel.style.color = 'var(--cyan)';
  } else if (stable) {
    els.holdRing.style.stroke = 'var(--purple)';
    els.holdLabel.textContent = 'Hold...';
    els.holdLabel.style.color = 'var(--purple)';
  } else {
    els.holdRing.style.stroke = 'transparent';
    els.holdLabel.textContent = '';
  }
}

export function updateCandidates(raw) {
  if (!els.candidatesDisplay) return;
  if (!raw || raw.length === 0) {
    els.candidatesDisplay.innerHTML = '';
    return;
  }

  els.candidatesDisplay.innerHTML = raw
    .slice(0, 3)
    .map((g, i) => {
      const pct = Math.min(100, (g.score / 10) * 100).toFixed(0);
      const opacity = i === 0 ? '1' : '0.5';
      return `<span class="candidate-item" style="opacity:${opacity}">
        <span class="candidate-name">${g.name}</span>
        <span class="candidate-score">${pct}%</span>
      </span>`;
    })
    .join('');
}

export function flashLetterAdded(letter) {
  const flash = document.createElement('div');
  flash.className = 'letter-added-flash';
  flash.textContent = letter;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);
}

export function updateSentence(text) {
  if (text.length === 0) {
    els.sentenceDisplay.innerHTML =
      '<span class="sentence-placeholder">Start signing...</span>';
  } else {
    els.sentenceDisplay.innerHTML =
      text + '<span class="sentence-cursor"></span>';
  }
}

function highlightRef(letter) {
  clearRefHighlight();
  if (!letter) return;
  const refEl = document.getElementById(`ref-${letter}`);
  if (refEl) refEl.classList.add('active');
}

function clearRefHighlight() {
  document.querySelectorAll('.ref-item.active')
    .forEach((el) => el.classList.remove('active'));
}

export function getButtons() {
  return {
    space: els.btnSpace,
    backspace: els.btnBackspace,
    clear: els.btnClear,
    speak: els.btnSpeak,
  };
}

// ============================
// Performance Overlay
// ============================

function buildPerformanceOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'perf-overlay';
  overlay.className = 'perf-overlay';
  overlay.innerHTML = `
    <span class="perf-item" id="perf-fps">-- FPS</span>
    <span class="perf-item" id="perf-latency">-- ms</span>
  `;
  document.body.appendChild(overlay);

  els.perfFps = document.getElementById('perf-fps');
  els.perfLatency = document.getElementById('perf-latency');
}

export function updatePerformance(metrics) {
  if (els.perfFps) {
    els.perfFps.textContent = `${metrics.fpsDisplay} FPS`;
    // Color-code FPS
    if (metrics.fps < 15) {
      els.perfFps.style.color = '#ef4444';
    } else if (metrics.fps < 25) {
      els.perfFps.style.color = '#f59e0b';
    } else {
      els.perfFps.style.color = '#22c55e';
    }
  }
  if (els.perfLatency) {
    els.perfLatency.textContent = `${metrics.latencyDisplay}`;
  }
}

// ============================
// Mini-History Bar
// ============================

const historyItems = [];
const MAX_HISTORY = 5;

function buildHistoryBar() {
  const bar = document.createElement('div');
  bar.id = 'history-bar';
  bar.className = 'history-bar';
  bar.innerHTML = `<span class="history-label">Recent:</span><span class="history-items" id="history-items"></span>`;

  // Insert after candidates display or at the end of the detection panel
  const detPanel = document.querySelector('.detection-panel') || document.body;
  detPanel.appendChild(bar);

  els.historyItems = document.getElementById('history-items');
}

export function addToHistory(gestureName) {
  const displayChar = gestureName.length === 1 ? gestureName : gestureName.split(' ')[0];
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  historyItems.push({ char: displayChar, time: timestamp });
  if (historyItems.length > MAX_HISTORY) historyItems.shift();

  if (els.historyItems) {
    els.historyItems.innerHTML = historyItems
      .map((item, i) => {
        const opacity = 0.4 + (i / MAX_HISTORY) * 0.6;
        return `<span class="history-entry" style="opacity:${opacity.toFixed(2)}" title="${item.time}">${item.char}</span>`;
      })
      .join('');
  }
}
