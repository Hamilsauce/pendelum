import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import { SynthParamConfig } from '../lib/audio-param-config.js';
import { ParamControl } from './ParamControl.js';

const { template, DOM, utils } = ham;

export const ViewOptions = {
  templateName: '',
  elementProperties: ElementProperties,
  children: [],
}



export class ParamControls {
  #self;

  constructor() {
    this.#self = template('param-controls');

    this.onParamChange = this.#onParamChange.bind(this);



    SynthParamConfig
  }

  get self() { return this.#self };

  get dataset() { return this.self.dataset };

  get id() { return this.#self.id };

  get dom() { return this.#self };

  get playIcon() { return this.selectDOM('#play-icon') };

  get pauseIcon() { return this.selectDOM('#pause-icon') };


  init(options) {
    throw 'Must define init in child class of view. Cannot call create on View Class. '
  }

  createParamGroup(config) {
    const el = new ParamControl(config);
    
    this.#self.append(el);
  }


  #onParamChange(e) {
    const input = e.target.closest('[data-param]');

    if (input && input.dataset.param === 'duration') {
      const param = input.dataset.param;
      const value = coerce(input.value);

      paramsStore.dispatch(updateDuration({ time: value }));

      anim.duration = value;
    }

    else if (input && input.dataset.param === 'oscillator') {
      const param = input.dataset.param;
      const value = coerce(input.selectedOptions[0].value);

      paramsStore.dispatch(updateOscillator({ waveType: value }));
    }

    else if (input && input.dataset.param === 'delayTime') {
      const param = input.dataset.param;
      const value = coerce(input.value);

      paramsStore.dispatch(updateDelay({ time: value }));
    }

    else if (input && input.dataset.param === 'warbler') {
      paramsStore.dispatch(updateWarbler({ active: e.target.closest('.control-group') }));
    }
  }


  selectDOM(selector) {
    const result = [...this.#self.querySelectorAll(selector)];

    return result.length === 1 ? result[0] : result;
  }
};