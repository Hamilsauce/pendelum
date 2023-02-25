// import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
// const { template, utils, rxjs } = ham;

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

class FrequencyDot {
  #sprite = null;
  #track = null;
  #dir = -1;
  #positionSubject$;
  #frequencySubject$;
  #frequency$

  constructor(initDir = -1) {
    this.#frequencySubject$ = new BehaviorSubject({ frequency: 150 })
    this.#dir = initDir;

    this.#frequency$ = this.#frequencySubject$.asObservable();

    this.#positionSubject$ = new BehaviorSubject(0)
      .pipe(
        map(this.getPointOnTrack.bind(this)),
        map(this.translateToPoint.bind(this)),
        map(this.getFrequency.bind(this)),
      );
  }

  get frequency$() { return this.#frequency$ }

  init(spriteSelector, trackSelector) {
    this.#sprite = document.getElementById(spriteSelector);
    this.#track = document.getElementById(trackSelector);

    this.#positionSubject$.subscribe(this.#frequencySubject$)

    return this.frequency$
  }

  getPointOnTrack(u) {
    let spot;

    if (this.#dir > 0) {
      spot = this.#track.getTotalLength() - (u * this.#track.getTotalLength());
    }

    else spot = (u * this.#track.getTotalLength());

    if (u >= 1) {
      this.#dir = -this.#dir;
    }

    const p = this.#track.getPointAtLength(spot);

    return p;
  }

  translateToPoint(pt = new DOMPoint()) {
    this.#sprite.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);

    return pt;
  }

  getFrequency(pt = new DOMPoint()) {
    const frequency = (100 + pt.y) * 2;

    return { frequency };
  }

  move(u) {
    this.#positionSubject$.next(u);
  }
}

export const dot = new FrequencyDot();
// export const dot2 = new FrequencyDot(1);

export const anim = {
  start: function(duration) {
    this.duration = duration;
    this.tZero = Date.now();

    requestAnimationFrame(() => this.run());
  },

  run: function() {
    let u = Math.min((Date.now() - this.tZero) / this.duration, 1);

    if (u < 1) {
      requestAnimationFrame(() => this.run());
    } else {
      this.onFinish();
    }

    dot.move(u);
  },

  onFinish: function() {
    this.start(this.duration);
  }
};

export const anim2 = {
  start: function(duration) {
    this.duration = duration / 1.01;
    this.tZero = Date.now();
    requestAnimationFrame(() => this.run());
  },

  run: function() {
    let u = Math.min((Date.now() - this.tZero) / this.duration, 1);

    if (u < 1) {
      requestAnimationFrame(() => this.run());
    } else {
      this.onFinish();
      // setTimeout(() => {
      //   console.log(' ', );
      // }, 250)
    }

    dot2.move(u);
  },

  onFinish: function() {
    this.start(this.duration <= 5 && this.duration >= 0.01 ? this.duration / 1.01 : this.duration <= 5 && this.duration <= 0.01 ? this.duration * 1.01 : this.duration/1.01);
  }
};