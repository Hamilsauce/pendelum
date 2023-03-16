import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import { SynthParamConfig } from '../lib/audio-param-config.js';
const { template, DOM, utils } = ham;

export const ViewOptions = {
  templateName: '',
  elementProperties: ElementProperties,
  children: [],
}



export class ParamControls {
  #self;
  #name;

  constructor() {

    this.#self = template('param-controls');

    this.#self.firstElementChild.addEventListener('click', e => {
      this.toggleIcons()
    });

    this.#name = name;
    
    SynthParamConfig
  }

  get self() { return this.#self };

  get dataset() { return this.self.dataset };

  get textContent() { return this.self.textContent };

  set textContent(v) { this.dom.textContent = v }

  get id() { return this.#self.id };

  get dom() { return this.#self };

  get name() { return this.#name };

  get playIcon() { return this.selectDOM('#play-icon') };

  get pauseIcon() { return this.selectDOM('#pause-icon') };


  init(options) {
    throw 'Must define init in child class of view. Cannot call create on View Class. '
  }

createParamGroup(paramConfig) {
const el = DOM.createElement(paramConfig)
}

  // toggleIcons() {
  //   if (this.playIcon.style.display === 'none') {
  //     this.playIcon.style.display = null;
  //     this.pauseIcon.style.display = 'none';
  //   } else {
  //     this.pauseIcon.style.display = null;
  //     this.playIcon.style.display = 'none';
  //   }
  // }


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