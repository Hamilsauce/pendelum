import { defineStore } from '../lib/rx-store.js';


const initialParamsState = {
  duration: {
    time: 1000
  },
  oscillator: {
    level: 0.3,
    waveType: 'triangle',
  },
  delay: {
    active: true,
    level: 0.3,
    time: 0.25,
  },
  warbler: {
    active: true,
    level: 0.3,
    time: 10,
    modifier: 1.25,
  }
};


const synthParamsReducer = (state, action) => {
  switch (action.type) {
    case 'duration': {
      const { time } = action;

      if (!time) return { ...state };

      return {
        ...state,
        duration: { ...state.duration, time }
      };
    }

    case 'oscillator': {
      const { oscillator } = action;
      const { type, level } = oscillator;

      if (!(type || level)) return { ...state };

      return {
        ...state,
        oscillator: { ...state.oscillator, type, level }
      }
    }

    case 'delay': {
      const { time, level } = action;

      if (!(time)) return { ...state };

      return {
        ...state,
        delay: { ...state.delay, time }
      }
    }

    case 'warbler': {
      const { active, level, time, modifier } = action;

      if (typeof active != 'boolean') return { ...state };

      return {
        ...state,
        warbler: { ...state.warbler, active }
      }
    }

    default:
      return state;
  }
};


export const getSynthParamsStore = defineStore('synthParams', {
  state: initialParamsState,
  reducer: synthParamsReducer
})