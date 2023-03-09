// import { chromaticScale } from '../chromatic-generator.js';
export const toneList = (await (await fetch('../data/note-frequencies.json')).json()).notes;

export const toneGenerator = chromaticScale;

export const toneMap = new Map(toneList.map(_ => [_.pitch, _]));

const getToneAtPosition = (base, steps) => {

};

let currentNote = chromaticScale.next()
currentNote = chromaticScale.next(24)
currentNote = chromaticScale.next(24)
// currentNote = chromaticScale.next(12)

console.log('currentNote', currentNote)