import { createAction } from '../lib/create-action.js';

export const updateDuration = createAction(
  'duration', {
    time: Number
  }
)

export const updateVolume = createAction(
  'volume', {
    level: Number
  }
)

export const updateOscillator = createAction(
  'oscillator', {
    oscillator: Object,
  }
)

export const updateDelay = createAction(
  'delay', {
    time: Number,
    // level:  Number,
  }
)

export const updateWarbler = createAction(
  'warbler', {
    active: Boolean,
    // time:  Number,
    // level:  Number,
  }
)