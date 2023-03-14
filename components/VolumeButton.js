import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import { getSynthParamsStore } from '../store/synth-params/synth-params.store.js';
import { updateVolume } from '../store/synth-params/synth-params.actions.js';

const { template, DOM, utils } = ham;

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

const paramsStore = getSynthParamsStore()


export class VolumeButton extends EventEmitter {
  #self;
  #name;

  constructor() {
    super();

    this.#self = template('volume-input');

    this.rangeInput.style.width = '0px';
    
    this.rangeInput.style.display = 'none';

    this.volume$ = fromEvent(this.rangeInput, 'pointermove').pipe(
      map(({ target }) => updateVolume({ level: +target.value / 100 })),
      tap(_ => paramsStore.dispatch(_))
    ).subscribe();

    this.#self.addEventListener('click', e => {
      this.toggleRangeInput();
     
      setTimeout(() => {
        this.rangeInput.focus();
      }, 0);
    });

    this.rangeInput.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
    });

    this.rangeInput.addEventListener('change', e => {
      this.toggleRangeInput();
    });
  }

  get self() { return this.#self };

  get dataset() { return this.self.dataset };

  get textContent() { return this.self.textContent };

  set textContent(v) { this.dom.textContent = v }

  get id() { return this.#self.id };

  get dom() { return this.#self };

  get name() { return this.#name };

  get icon() { return this.selectDOM('#volume-icon') };

  get button() { return this.selectDOM('#volume-button') };

  get rangeInput() { return this.selectDOM('#volume-range') };


  toggleRangeInput() {
    if (this.rangeInput.style.display === 'none') {
      this.button.style.display = 'none';

      this.rangeInput.style.display = null;
      this.rangeInput.style.opacity = '1';

      setTimeout(() => {
        // this.rangeInput.style.display = null;
      this.#self.style.width = '88px';
      this.rangeInput.style.width = '88px';
      }, 0)

    } else {
      this.rangeInput.style.width = '0px';
      this.#self.style.width = '34px';
      this.rangeInput.style.opacity = '0';

      setTimeout(() => {
        this.rangeInput.style.display = 'none';
      }, 200)

      setTimeout(() => {
        this.button.style.display = null;
      }, 300)

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