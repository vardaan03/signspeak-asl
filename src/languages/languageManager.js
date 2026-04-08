import { aslPack } from './asl/index.js';

/**
 * Registry of all available language packs.
 * Currently only ASL is fully implemented. BSL and others can be added here.
 */
const languageRegistry = {
  'asl': aslPack,
};

let currentLanguageId = 'asl';

// Load from local storage if available
try {
  const saved = localStorage.getItem('signspeak_language');
  if (saved && languageRegistry[saved]) {
    currentLanguageId = saved;
  }
} catch (e) {}

let listeners = [];

export function getAvailableLanguages() {
  return Object.values(languageRegistry).map(pack => ({
    id: pack.id,
    name: pack.name,
    region: pack.region,
    handedness: pack.handedness
  }));
}

export function getCurrentPack() {
  return languageRegistry[currentLanguageId];
}

export function getCurrentLanguageId() {
  return currentLanguageId;
}

export function setLanguage(id) {
  if (!languageRegistry[id]) {
    console.error(`Language pack '${id}' not found.`);
    return false;
  }
  
  if (currentLanguageId !== id) {
    currentLanguageId = id;
    try {
      localStorage.setItem('signspeak_language', id);
    } catch (e) {}
    
    // Notify listeners
    listeners.forEach(fn => fn(getCurrentPack()));
  }
  
  return true;
}

export function onLanguageChange(callback) {
  listeners.push(callback);
}

export function removeLanguageChangeListener(callback) {
  listeners = listeners.filter(fn => fn !== callback);
}
