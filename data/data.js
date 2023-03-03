import noteArray from './notes.js';

const sourceUrl = './note-frequencies.json';

const frequencyMap = new Map(noteArray.notes.map(_ => [Math.trunc(_.frequency), _]))

export const noteDataSets = {
  noteArray,
  frequencyMap
}