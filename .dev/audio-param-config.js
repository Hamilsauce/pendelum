
export const WaveTypes = new Set(['triangle', 'sine', 'sawtooth']);

export const SynthParamConfig = [
  {
    name: 'duration',
    valueType: 'number',
    inputType: 'number',
    defaultValue: 1000,

  },
  {
    name: 'waveType',
    valueType: WaveType,
    inputType: 'select',
    defaultValue: 'triangle',
  },
  {
    name: 'delayTime',
    valueType: 'number',
    inputType: 'number',
    defaultValue: 'triangle',
  },
];