const getCurve = (...values) => new Float32Array(values)
// .fill(0)
// .map((_, i, arr) => {
//   if (i == 0) {
//     return 0
//   }
//   else if (i === arr.length - 1) {
//     return gainModifier
//   }

//   else {
//     return (i / 10)
//   }
// })

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
      this.warblerIntervalHandle = setInterval(() => {
        let freq = this.#oscillator.frequency.value

        this.#gains.oscillator.gain.exponentialRampToValueAtTime(
          0.16,
          this.#ctx.currentTime + 0.5
        );

        this.#oscillator.frequency.exponentialRampToValueAtTime(this.#oscillator.frequency.value * 2, this.#ctx.currentTime + 1.25);

        setTimeout(() => {
          this.#oscillator.frequency.exponentialRampToValueAtTime(freq, this.#ctx.currentTime + 1.5);
        }, 1000)

      }, 100);
    } else {
      clearInterval(this.warblerIntervalHandle);
    }
  }

  removeGain(gain) {
    // Important! Setting a scheduled parameter value

    // gain.gain.setValueAtTime(gain.gain.value, this.#ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.#ctx.currentTime + 0.03);

    this.#gainstash = this.#gainstash.filter(_ => _ !== gain);
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
    this.type = type;

    return type;
  }

  setParams(paramMap) {
    Object.assign(this, paramMap);
  }

  setDelay({ time, level }) {
    if (time) {
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
    }

    if (this.playing) return 0;

    this.#oscillator.start(this.#ctx.currentTime);
    this.#gain.connect(this.#ctx.destination);
    this.playing = true;
  }
}