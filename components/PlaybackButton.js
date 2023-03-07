import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
const { template, DOM, utils } = ham;

export class PlaybackButton extends EventEmitter {
  #self;
  #name;

  constructor() {
    super();

    this.#self = template('playback-button');
 
    this.#self.firstElementChild.addEventListener('click', e => {
      this.toggleIcons()
    });
    
    this.#name = name;
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


  toggleIcons() {
    if (this.playIcon.style.display === 'none') {
      this.playIcon.style.display = null;
      this.pauseIcon.style.display = 'none';
    } else {
      this.pauseIcon.style.display = null;
      this.playIcon.style.display = 'none';
    }
  }

  init(options) {
    throw 'Must define init in child class of view. Cannot call create on View Class. '
  }

  selectDOM(selector) {
    const result = [...this.#self.querySelectorAll(selector)];

    return result.length === 1 ? result[0] : result;
  }
};