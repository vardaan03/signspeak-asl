import { analyzeTwoHands, matchTwoHandGesture } from '../twoHandAnalyzer.js';
import fp from 'fingerpose';

// Define placeholder standard Fingerpose gestures for BSL (stubbed out for now, 
// as BSL is heavily two-handed and we focus on vowels first)

// Basic reference data for the UI
export const bslAlphabetReference = [
  { letter: 'A', desc: 'Index touches non-dominant thumb tip', bodyRelative: false },
  { letter: 'E', desc: 'Index touches non-dominant index tip', bodyRelative: false },
  { letter: 'I', desc: 'Index touches non-dominant middle tip', bodyRelative: false },
  { letter: 'O', desc: 'Index touches non-dominant ring tip', bodyRelative: false },
  { letter: 'U', desc: 'Index touches non-dominant pinky tip', bodyRelative: false },
];

export const bslPack = {
  id: 'bsl',
  name: 'British Sign Language',
  region: 'United Kingdom',
  handedness: 'two-handed',
  
  // Return any static 1-hand components (we'll leave empty for now,
  // rely on the disambiguate loop for the two-handed logic to override)
  getGestures: () => [],
  
  getReferenceData: () => [
    { title: 'Alphabet Vowels', items: bslAlphabetReference },
    { title: 'Consonants (Coming Soon)', items: [] }
  ],

  // BSL heavily relies on two hands. The disambiguate function in a two-handed 
  // pack receives more context. For now, we'll implement a custom handler
  disambiguate: (gestureName, landmarks, features, palmSize, thumbPos) => {
    // Standard one-hand fallback
    return null; 
  },
  
  // Custom method exposed for BSL: process two hands
  analyzeInteraction: (hands) => {
     if (hands && hands.length === 2) {
       const interactionState = analyzeTwoHands(hands);
       if (interactionState && interactionState.touching) {
         const match = matchTwoHandGesture(interactionState);
         if (match) {
           return { name: match, score: 9.0 };
         }
       }
     }
     return null;
  },

  // Motion gestures for this language
  recordTrajectory: () => {},
  detectMotionSigns: () => [],
  resetTrajectory: () => {}
};
