import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import { SynthParamConfig } from '../lib/audio-param-config.js';

import { coerce } from '../lib/utils.js';

const { template, DOM, utils } = ham;

export const ViewOptions = {
  templateName: '',
  elementProperties: ElementProperties,

  children: [],
}

export const ParamConfig = {
  param: 'oscillator',
  name: 'waveType',
  type: 'select',
  options: [...WaveTypes],
  default: 'triangle',
  active: true,
  label: 'Wave Type',
};

export class ParamControl {
  #self;
  #name;

  constructor(config = ParamConfig) {
    this.config = config
    this.#self = template('param-control');

    this.#name = name;

    const input = DOM.createElement({
      tag: config.type === 'select' ? config.type : 'input',
      elementProperties: {
        type: config.type === 'select' ? undefined : config.type,
        value: config.type === 'select' ? undefined : config.default,
        dataset: {
          param: config.name
        },
        onclick: (e) => {
          if (e.target.classList.contains('control-label')) {
            this.toggleActive();

            this.emit({ param: this.config.param, active: this.isActive })
          }
        },
        onchange: () => {},
      },
      children: config.type !== 'select' ? [] : config.options.map(({ content, value }) => DOM.createElement({ tag: 'option', elementProperties: { textContent: content, value } })),
    });

    this.selectDOM('.control-input-container').innerHTML = ''

    this.selectDOM('.control-input-container').append(input);

    this.label.textContent = config.label
  }

  get self() { return this.#self };

  get dataset() { return this.self.dataset };

  get id() { return this.#self.id };

  get dom() { return this.#self };

  get name() { return this.#name };

  get isActive() { return this.dataset.active === 'true' ? true : false; }

  get label() { return this.selectDOM('.control-label') };

  get input() { return this.selectDOM('.control-input-container').firstElementChild };

  get value() { return this.config.type === 'select' ? this.input.selectedOptions[0] : coerce(this.input.value) }


  init(options) {
    throw 'Must define init in child class of view. Cannot call create on View Class. '
  }

  emit(type, detail) {
    this.#self.dispatchEvent(new CustomEvent('paramchange', { bubbles: true, detail }));
  }

  toggleActive(state) {
    this.dataset.active = state || !this.isActive;
  }

  selectDOM(selector) {
    const result = [...this.#self.querySelectorAll(selector)];

    return result.length === 1 ? result[0] : result;
  }
};


import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
const { template, DOM, utils } = ham;

export const ElementProperties = {
  id: String,
  classList: Array,
  dataset: Object,
}


export class View extends EventEmitter {
  #self;
  #name;

  constructor(name, options = ViewOptions) {
    super();

    if (!name) throw new Error('No name passed to constructor for ', this.constructor.name);

    if (options && options !== ViewOptions) {
      this.#self = DOM.createElement(options)
    }

    else this.#self = View.#getTemplate(name);

    if (!this.#self) throw new Error('Failed to find/load a view class template. Class/template name: ' + name);

    this.#name = name;

    this.dataset.id = View.uuid(name);
  }

  get self() { return this.#self };

  get dataset() { return this.self.dataset };

  get textContent() { return this.self.textContent };

  set textContent(v) { this.dom.textContent = v }

  get id() { return this.#self.id };

  get dom() { return this.#self };

  get name() { return this.#name };

  static #getTemplate(name) {
    return template(name);
  }

  static uuid(name) {
    return (name.slice(0, 1).toLowerCase() || 'o') + utils.uuid();
  }

  create() {
    throw 'Must define create in child class of view. Cannot call create on View Class. '
  }

  init(options) {
    throw 'Must define init in child class of view. Cannot call create on View Class. '
  }

  selectDOM(selector) {
    const result = [...this.#self.querySelectorAll(selector)];

    return result.length === 1 ? result[0] : result;
  }
};