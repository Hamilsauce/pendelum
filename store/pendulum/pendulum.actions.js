import { createAction } from '../lib/create-action.js';


export const updateVertex = createAction(
  '[ Update Vertex ]', {
    vertex: String,
    x: Number,
    y: Number
  }
)

export const updateControl = createAction(
  '[ Update Control ]', {
    control: String,
    x: Number,
    y: Number
  }
)

export const updateFrequencyDot = createAction(
  '[ Update Frequency Dot ]', {
    x: Number,
    y: Number
  }
)