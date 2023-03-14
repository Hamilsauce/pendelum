import { AudioController } from './components/AudioController.js'
import { noteDataSets } from './data/notes.data.js';
import { PlaybackButton } from './components/PlaybackButton.js';
import { VolumeButton } from './components/VolumeButton.js';
import { roundTwo, coerce } from './lib/utils.js';
import { anim, dot } from './components/rx-pendulum.js';

import { getSynthParamsStore } from './store/synth-params/synth-params.store.js';
import { updateDuration, updateOscillator, updateDelay, updateWarbler } from './store/synth-params/synth-params.actions.js';

import { getPendulumStore } from './store/pendulum/pendulum.store.js';
// import { updateVertex, updateControl, updateFrequencyDot } from './store/pendulum/pendulum.actions.js';

import { getArpRhythm } from './lib/create-rhythm.js';


const { interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


const paramsStore = getSynthParamsStore()
const pendulumStore = getPendulumStore()


const pbButton = new PlaybackButton();
const volumeButton = new VolumeButton();

const playbackControls = document.querySelector('#playback-controls');

playbackControls.append(
  volumeButton.dom,
  pbButton.dom,
);

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

    const controlGroups = [...document.querySelectorAll('.control-group')]

    const durationLabel = document.querySelector('#duration-label')
    const delayTimeLabel = document.querySelector('#delay-time-label')
    const waveTypeLabel = document.querySelector('#wave-type-label')
    const warblerLabel = document.querySelector('#warbler-label')

    waveTypeLabel.addEventListener('click', e => {
      const t = e.target
      const p = t.closest('.control-group');
      const currState = p.dataset.active === 'true' ? true : false;

      p.dataset.active = !currState
      p.querySelector('select').disabled = p.dataset.active == 'false' ? true : false;
      paramsStore.dispatch(updateOscillator({ level: !currState ? 0.5 : 0.001 }))
    });

    durationLabel.addEventListener('click', e => {
      const t = e.target
      const p = t.closest('.control-group');
      const currState = p.dataset.active === 'true' ? true : false;

      p.dataset.active = !currState
      p.querySelector('input').disabled = p.dataset.active == 'false' ? true : false;

      anim.toggleHold();
    });

    delayTimeLabel.addEventListener('click', e => {
      const t = e.target
      const p = t.closest('.control-group');

      const currState = p.dataset.active === 'true' ? true : false;
      p.dataset.active = !currState
      p.querySelector('input').disabled = p.dataset.active == 'false' ? true : false;
      this.audio.toggleNode({ name: 'delay', state: !currState })
    });

    warblerLabel.addEventListener('click', e => {
      const t = e.target
      const p = t.closest('.control-group');

      const currState = p.dataset.active === 'true' ? true : false;
      p.dataset.active = !currState
      paramsStore.dispatch(updateWarbler({ active: !currState }))
      // this.audio.toggleNode({ name: 'delay', state: !currState })
    });
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


    // const arp$ = getArpRhythm().pipe(
    //   // map(x => x),
    //   // tap(x => console.log('getArpRhythm', x)),
    //   // tap(frequency => this.#oscillator.frequency.value = frequency),
    //   // map(this.audio.setFrequency),
    // )
    // .subscribe();

    // console.log('arp$', arp$)

    dot.frequency$.pipe(
      // tap(x => console.log('x', x)),
      // mergeMap(({ frequency }) => arp$.pipe(
      //   map(x => x),
      //   tap(x => console.log('TAP', x)),
      // ), ),
      // map(this.audio.setFrequency),
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

  #togglePlayback(state) {
    if (state === false || this.audio.playing) {
      this.audio.suspend();
      anim.hold();
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