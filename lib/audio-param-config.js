export const WaveTypes = new Set(['triangle', 'sine', 'sawtooth']);

export const SynthParamConfig = [
  {
    label: 'Duration',
    name: 'duration',
    type: 'number',
    valueType: 'number',
    inputType: 'number',
    default: 1000,
    active: true,
  },
  {
    label: 'Wave Type',
    name: 'waveType',
    type: 'select',
    options: [...WaveTypes],
    valueType: WaveType,
    inputType: 'select',
    default: 'triangle',
    active: true,
  },
  {
    label: 'Delay Time',
    name: 'delayTime',
    type: 'number',
    valueType: 'number',
    inputType: 'number',
    default: 0.3,
    active: true,
  },
];