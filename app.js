import { AudioController } from './components/AudioController.js'
import { noteDataSets } from './data/data.js';

import { roundTwo, coerce } from './lib/utils.js';
import {
  anim,
  dot,
  // anim2,
  // dot2
} from './components/rx-pendulum.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

console.log('noteDataSets.frequencyMap', [...noteDataSets.frequencyMap])


export class App {
  self = document.querySelector('#app');
  header = document.querySelector('#app-header');
  frequencyDisplay = document.querySelector('#frequency-value');
  noteDisplay = document.querySelector('#note-value');
  body = document.querySelector('#app-body');
  startPrompt = document.querySelector('#start-prompt');
  startButton = document.querySelector('#start-button');
  audio = new AudioController();


  constructor() {
    this.onParamChange = this.#onParamChange.bind(this);
    this.onStart = this.#onStart.bind(this);


    this.params.duration.value = coerce(this.params.duration.value);

    this.startPrompt.style.top = `${(this.body.getBoundingClientRect().top) + 40}px`
    this.startPrompt.style.left = `${(this.width / 2) - (this.startPrompt.getBoundingClientRect().width / 2)}px`


    console.log('this.startButton', this.#onStart)


    this.startButton.addEventListener('click', this.onStart);
    this.self.addEventListener('change', this.onParamChange);
  }

  get params() {
    return {
      duration: this.self.querySelector('#duration-input'),
      oscillator: this.self.querySelector('#oscillator-input'),
    }
  }

  get width() { return this.self.getBoundingClientRect().width }

  get height() { return this.self.getBoundingClientRect().height }

  // init({ duration = 1000 }) {
  //   this.params.duration.value = duration;

  //   this.startPrompt.style.left = `${(this.width / 2) - (this.startPrompt.getBoundingClientRect().width/2)}px`

  //   this.startButton.addEventListener('click', e => {
  //     audio.play();
  //     this.startPrompt.remove();
  //   });
  // }

  // #onParamChange(e) {
  //   const input = e.target.closest('[data-param]');

  //   if (input) {
  //     const param = input.dataset.param;
  //     const value = coerce(input.value);

  //     this.audio.setParams({
  //       [param]: value
  //     });
  //   }
  // }

  #onStart(e) {
    this.audio.play();
    this.startPrompt.remove();

    this.frequency$ = dot.init('dot', 'curve');

    dot.frequency$.pipe(
      map(this.audio.setFrequency),
      tap(freq => {
        const truncFreq = Math.trunc(freq)
        const note = noteDataSets.frequencyMap.get(truncFreq)

        if (note) {
          this.frequencyDisplay.textContent = truncFreq
          this.noteDisplay.textContent = note.pitch;
        } else {
          this.noteDisplay.textContent = this.noteDisplay.textContent
          this.frequencyDisplay.textContent = this.frequencyDisplay.textContent
        }
      }),
      // map(({ frequency }) => osc.frequency.value = (frequency + 100) * 2),
    ).subscribe();

    anim.start(+this.params.duration.value);

    // setTimeout(() => {
    //   dot.stop()
    //   console.log(' ', );
    // }, 2230)
  }

  #onParamChange(e) {
    const input = e.target.closest('[data-param]');

    if (input && input.dataset.param === 'duration') {
      const param = input.dataset.param;
      const value = coerce(input.value);

      anim.duration = value;
    }

    else if (input && input.dataset.param === 'oscillator') {
      const param = input.dataset.param;
      const value = coerce(input.value);

      this.audio.setType({ type: value });
    }
  }
}