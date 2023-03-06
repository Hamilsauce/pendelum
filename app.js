import { AudioController } from './components/AudioController.js'
import { noteDataSets } from './data/data.js';
import { PlaybackButton } from './components/PlaybackButton.js';
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

const pbButton = new PlaybackButton();

const playbackControls = document.querySelector('#playback-controls');
playbackControls.append(pbButton.dom);

export class App {
  self = document.querySelector('#app');
  header = document.querySelector('#app-header');
  frequencyDisplay = document.querySelector('#frequency-value');
  noteDisplay = document.querySelector('#note-value');
  body = document.querySelector('#app-body');
  startPrompt = document.querySelector('#start-prompt');
  startButton = document.querySelector('#start-button');
  audio = (new AudioController() || new webkitAudioContext());

  constructor() {
    this.onPlaybackChange = this.#onPlaybackChange.bind(this);
    this.onParamChange = this.#onParamChange.bind(this);
    this.onStart = this.#onStart.bind(this);

    this.params.duration.value = coerce(this.params.duration.value);

    this.startPrompt.style.left = `${(this.width / 2) - (this.startPrompt.getBoundingClientRect().width / 2)}px`

    this.startButton.addEventListener('click', this.onStart);
    this.self.addEventListener('change', this.onParamChange);
    pbButton.dom.addEventListener('click', this.onPlaybackChange);
  }

  get params() {
    return {
      duration: this.self.querySelector('#duration-input'),
      oscillator: this.self.querySelector('#oscillator-input'),
    }
  }

  get width() { return this.self.getBoundingClientRect().width }

  get height() { return this.self.getBoundingClientRect().height }

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

  #onPlaybackChange(e) {
    if (this.audio.playing) {
      this.audio.suspend();
      anim.stop();
    }
    else {
      this.audio.resume();
      anim.start();
    }
    
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