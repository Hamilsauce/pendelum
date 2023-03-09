import noteArray from './notes.js';

const sourceUrl = './note-frequencies.json';

const frequencyMap = new Map(noteArray.notes.map(_ => [Math.trunc(_.frequency), _]))

export const pitchMap = new Map(noteArray.notes.map(_ => [_.pitch, _]));

const pitchIndex = noteArray.notes.map(({ pitch }) => pitch)

const getArpeggio = (baseNote = 'C3', steps = 3) => {
  const notes = []
  let curr = baseNote;
  while (notes.length <= steps) {
    notes.push(noteArray.notes[pitchIndex.indexOf(curr)])

    curr = noteArray.notes[pitchIndex.indexOf(curr)].pitch
  }
return notes
};


export const noteDataSets = {
  noteArray,
  frequencyMap,
  pitchMap,
  getArpeggio
}