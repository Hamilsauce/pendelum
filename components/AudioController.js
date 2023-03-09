import { getSynthParamsStore } from '../store/synth-params/synth-params.store.js';

const paramsStore = getSynthParamsStore()

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

const getCurve = (...values) => new Float32Array(values)

export class AudioController {
  #type = 'triangle';
  #oscillator = null;
  #gain = null;
  #gains = null;
  #ctx = null;
  #gainstash = [];
  #controllers = [];
  #delay = null;

  constructor() {
    this.played = false;
    this.playing = false;
    this.#controllers = [];
    this.#gainstash = []

    this.#ctx = (new AudioContext() || new webkitAudioContext());

    this.#oscillator = this.#ctx.createOscillator()

    const pannerOptions = { pan: 0 };
    const panner = new StereoPannerNode(this.#ctx, pannerOptions);

    this.type = 'triangle';

    this.#gains = {
      oscillator: new GainNode(this.#ctx, { gain: 0.5 }),
      delay: new GainNode(this.#ctx, { gain: 0.3 }),
    }

    this.#delay = new DelayNode(this.#ctx, {
      delayTime: 0.5,
    });

    this.#oscillator.connect(this.#delay);

    this.#delay.connect(this.#gains.delay);

    this.#oscillator.connect(this.#gains.oscillator);

    this.#oscillator.frequency.value = 200;
    this.#gains.oscillator.connect(this.#ctx.destination);
    this.#gains.delay.connect(this.#ctx.destination);

    this.#gainstash.push(this.#gain);

    const curves = {
      up: [0.0, 0.1, 0.225, 0.325, 0.4, 0.5],
      down: [0.0, 0.1, 0.225, 0.325, 0.4, 0.5].reverse(),
    }

    this.lastFreq = this.#oscillator.frequency.value;

    this.toggleWarbler(true)

    this.setFrequency = this.#setFrequency.bind(this);

    this.params$ = paramsStore.select();

    this.params$
      .pipe(
        tap(({ oscillator, delay, warbler }) => {
          this.setOscillator(oscillator);
          this.setDelay(delay);
          this.setWarbler(warbler);
        }),
      )
      .subscribe();
  }

  get oscillatorTypes() { return ['sine', 'sawtooth', 'triangle'] }

  get type() { return this.#oscillator.type }

  set type(v) {
    this.#oscillator.type = v;
  }

  play() {
    this.#oscillator.start(this.#ctx.currentTime);
    this.playing = true;
  }

  toggleWarbler(state) {
    if (state) {
      clearInterval(this.warblerIntervalHandle || 0);

      this.warblerIntervalHandle = setInterval(() => {
        let freq = this.#oscillator.frequency.value

        this.#gains.oscillator.gain.exponentialRampToValueAtTime(
          0.08,
          this.#ctx.currentTime + 0.08
        );

        this.#oscillator.frequency.exponentialRampToValueAtTime(
          this.#oscillator.frequency.value * 1.67,
          this.#ctx.currentTime + 0.32
        );

        setTimeout(() => {
          this.#gains.oscillator.gain.exponentialRampToValueAtTime(
            0.0001,
            this.#ctx.currentTime + 0.08
          );

          this.#oscillator.frequency.exponentialRampToValueAtTime(
            this.#oscillator.frequency.value * 0.67,
            this.#ctx.currentTime + 0.08
          );
        }, 50)

      }, 125);
    } else {
      clearInterval(this.warblerIntervalHandle);
    }
  }

  resume() {
    this.#ctx.resume()
    this.playing = true;
  }

  suspend() {
    this.#ctx.suspend()
    this.playing = false;
  }

  stop(gain) {
    if (this.playing) {
      gain.disconnect();
      this.played = true;
      this.playing = false;
    }
  }

  #setFrequency({ frequency }) {
    this.#oscillator.frequency.value = frequency;

    return frequency;
  }


  setType({ type }) {
    this.#oscillator.type = v;

    return type;
  }

  setParams(paramMap) {
    Object.assign(this, paramMap);
  }

  setWarbler({ active }) {
    if (typeof active === 'boolean') {
      this.toggleWarbler(active)
    }
  }

  setOscillator({ type, level }) {
    if (type) {
      this.#oscillator.type = type;
    }
    if (level) {
      this.#gains.oscillator.gain.value = level;
    }
  }

  setDelay({ time, level }) {
    if (!isNaN(+time)) {
      this.#delay.delayTime.value = time;
    }
    if (level) {
      this.#gains.delay.gain.value = level;
    }
  }

  changeNote(note, frequency) {
    this.#oscillator.frequency.value = frequency;

    if (this.played) {
      this.played = false;
      this.playing = true;

      return this.#gain.connect(this.#ctx.destination);
    };

    if (this.playing) return 0;

    this.#oscillator.start(this.#ctx.currentTime);
    this.#gain.connect(this.#ctx.destination);
    this.playing = true;
  }
}