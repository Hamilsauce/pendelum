import { AudioController } from './components/AudioController.js'
import { noteDataSets } from './data/notes.data.js';
import { PlaybackButton } from './components/PlaybackButton.js';
import { roundTwo, coerce } from './lib/utils.js';
import {
  anim,
  dot,
  // anim2,
  // dot2
} from './components/rx-pendulum.js';
import { getSynthParamsStore } from './store/synth-params/synth-params.store.js';
import { updateDuration, updateOscillator, updateDelay, updateWarbler } from './store/synth-params/synth-params.actions.js';


const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const paramsStore = getSynthParamsStore()

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
  audio = null //(new AudioController() || new webkitAudioContext());

  constructor() {
    this.onPlaybackChange = this.#onPlaybackChange.bind(this);
    this.togglePlayback = this.#togglePlayback.bind(this);
    this.onParamChange = this.#onParamChange.bind(this);
    this.onStart = this.#onStart.bind(this);

    this.params.duration.value = coerce(this.params.duration.value);

    this.startPrompt.style.left = `${(this.width / 2) - (this.startPrompt.getBoundingClientRect().width / 2)}px`

    this.startButton.addEventListener('click', this.onStart);


    // window.onbeforeunload = (e) => {
    //   this.audio.suspend()
    // }

    // window.onfocus = this.togglePlayback;
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
    this.audio = new AudioController();
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
    ).subscribe();

    anim.start(+this.params.duration.value);

    this.self.addEventListener('change', this.onParamChange);

    pbButton.dom.addEventListener('click', this.onPlaybackChange);

    window.onblur = () => this.togglePlayback(false);
    window.onfocus = () => this.togglePlayback(false);
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
   
      paramsStore.dispatch(updateOscillator({oscillator:{ type: value }}));
    }

    else if (input && input.dataset.param === 'delayTime') {
      const param = input.dataset.param;
      const value = coerce(input.value);
      
      paramsStore.dispatch(updateDelay({ time: value }));
    }
    
    else if (input && input.dataset.param === 'warbler') {
      paramsStore.dispatch(updateWarbler({ active: e.target.checked }));
    }
  }

  #togglePlayback(state) {
    if (state === false || this.audio.playing) {
      this.audio.suspend();
      anim.stop();
    }
    else if (state === true || !this.audio.playing) {
      this.audio.resume();
      anim.start();
    }

    pbButton.toggleIcons();
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
  }
}