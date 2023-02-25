export class AudioController {
  #type = 'triangle';
  #oscillator = null;
  #gain = null;
  #ctx = null;
  #gainstash = [];
  #controllers = [];

  constructor() {
    this.played = false;
    this.playing = false;
    this.#controllers = [];
    this.#gainstash = []

    this.#ctx = new AudioContext();

    this.#oscillator = this.#ctx.createOscillator()
    // this.#oscillator.type =
    this.type = 'triangle'

    this.#gain = this.#ctx.createGain();

    this.#gain.gain.value = 0.5;
    this.#oscillator.frequency.value = 200;
    this.#oscillator.connect(this.#gain);


    this.#gainstash.push(this.#gain);
    this.updateGains();


    // this.play = () => {
    //   this.#oscillator.start(this.#ctx.currentTime);
    //   this.#oscillator.connect(this.#gain);
    //   this.#gain.connect(this.#ctx.destination);
    // };
    

    this.setFrequency = this.#setFrequency.bind(this);
  }

  play() {
    this.#oscillator.start(this.#ctx.currentTime);
    this.#oscillator.connect(this.#gain);
    this.#gain.connect(this.#ctx.destination);
  }

  updateGains() {
    const val = 0.76 / this.#gainstash.length;

    this.#gainstash.forEach((x, i) => {
      x.gain.exponentialRampToValueAtTime(val, this.#ctx.currentTime + 0.05);
    });
  }

  removeGain(gain) {
    // Important! Setting a scheduled parameter value

    // gain.gain.setValueAtTime(gain.gain.value, this.#ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.#ctx.currentTime + 0.03);

    this.#gainstash = this.#gainstash.filter(_ => _ !== gain);

    this.updateGains();
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

  get oscillatorTypes() { return ['sine', 'sawtooth', 'triangle'] }

  get type() { return this.#oscillator.type }

  set type(v) {
    this.#oscillator.type = v;
  }

  setType({ type }) {
    this.type = type;

    return type;
  }
 
  setParams(paramMap) {
    Object.assign(this, paramMap);
  }

  changeNote(note, frequency) {
    this.osc.frequency.value = frequency;

    if (this.played) {
      this.played = false;
      this.playing = true;

      return this.#gain.connect(this.#ctx.destination);
    }

    if (this.playing) return 0;

    this.osc.start(this.#ctx.currentTime);
    this.#gain.connect(this.#ctx.destination);

    this.playing = true;
  }
}