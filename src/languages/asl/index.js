import { alphabetGestures, alphabetReference } from '../../gestures/alphabet.js';
import { commonGestures, commonSignsReference } from '../../gestures/commonSigns.js';
import { numberGestures, numberReference } from '../../gestures/numberSigns.js';
import { customSignsReference, disambiguate as aslDisambiguate } from '../../gestures/landmarkAnalyzer.js';
import { recordTrajectory, detectMotionSigns, resetTrajectory } from '../../gestures/trajectoryTracker.js';

export const aslPack = {
  id: 'asl',
  name: 'American Sign Language',
  region: 'United States, Canada',
  handedness: 'one-handed',
  
  // The fingerpose GestureDescriptions
  getGestures: () => [...alphabetGestures, ...commonGestures, ...numberGestures],
  
  // The UI reference grid groups
  getReferenceData: () => [
    { title: 'Alphabet', items: alphabetReference },
    { title: 'Numbers', items: numberReference },
    { title: 'Common Signs', items: commonSignsReference },
    { title: 'Other Gestures', items: customSignsReference }
  ],

  // Specific disambiguation rules for this language
  disambiguate: (gestureName, landmarks, features, palmSize, thumbPos) => {
    return aslDisambiguate(gestureName, landmarks, features, palmSize, thumbPos);
  },

  // Motion gestures for this language
  recordTrajectory: (tip) => recordTrajectory(tip),
  detectMotionSigns: (gestures) => detectMotionSigns(gestures),
  resetTrajectory: () => resetTrajectory()
};
