import { defineStore } from '../lib/rx-store.js';
import { pointToFrequency } from '../../lib/utils.js';

const initialPendulumState = {
  viewport: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  frequencyDot: {
    x: 0,
    y: 20,
  },
  frequency: 220,
  path: {
    length: 0,
    vertices: {
      start: { x: 0, y: 0 },
      middle: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
    },
    controls: {
      start: { x: 0, y: 0 },
      middle: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
    },
  },
};


const pendulumReducer = (state, action) => {
  switch (action.type) {
    case '[ Update Vertex ]': {
      const { vertex, x, y } = action;

      if (!(vertex && x && y)) return { ...state };

      return {
        ...state,
        path: {
          ...state.path,
          vertices: {
            ...state.path.vertices,
            [vertex]: { ...state.path.vertices[vertex], x, y },
          }
        },
      };
    }

    case '[ Update Control ]': {
      const { control, x, y } = action;

      if (!(control && x && y)) return { ...state };

      return {
        ...state,
        path: {
          ...state.path,
          controls: {
            ...state.path.controls,
            [control]: { ...state.path.controls[control], x, y },
          }
        },
      };
    }

    case '[ Update Frequency Dot ]': {
      const { x, y } = action;

      if (!(x && y)) return { ...state };

      return {
        ...state,
        frequency: pointToFrequency({ y }),
        frequencyDot: { ...state.frequencyDot, x, y },
      };
    }

    default:
      return state;
  }
};


export const getPendulumStore = defineStore('pendulumStore', {
  state: initialPendulumState,
  reducer: pendulumReducer
});