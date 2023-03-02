import noteArray from './notes.js';
const sourceUrl = './note-frequencies.json';

// const noteArray = (await (await fetch(sourceUrl)).json()).notes;

const frequencyMap = new Map(noteArray.notes.map(_ => [Math.trunc(_.frequency), _]))

export const noteDataSets = {
  noteArray,
  frequencyMap
}