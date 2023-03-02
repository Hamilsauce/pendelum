const sourceUrl = '/data/note-frequencies.json';

const noteArray = (await (await fetch(sourceUrl)).json()).notes;

const frequencyMap = new Map(noteArray.map(_ => [Math.trunc(_.frequency), _]))

console.log('frequencyMap', [...frequencyMap])

export const noteDataSets = {
  noteArray,
  frequencyMap
}