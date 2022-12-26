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

  constructor() {
    this.#frequencySubject$ = new BehaviorSubject({ frequency: 150 })
      .pipe(
        map(x => x),
        // tap(({frequency}) => {
        //   if (this.audio) {
        //     this.audio.oscillator.frequency.value = frequency;
        //   }
        // })
      );

    this.#frequency$ = this.#frequencySubject$.asObservable();

    this.#positionSubject$ = new BehaviorSubject(0)
      .pipe(
        map(this.getPointOnTrack.bind(this)),
        map(this.setToPointOnTrack.bind(this)),
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

  setToPointOnTrack(pt = new DOMPoint()) {
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

// export const dot = {
//   sprite: null,
//   track: null,
//   dir: -1,

//   init: function(sprite, track) {
//     this.sprite = document.getElementById(sprite);
//     this.track = document.getElementById(track);
//   },

//   move: function(u) {
//     let spot;

//     if (this.dir > 0) {
//       spot = this.track.getTotalLength() - (u * this.track.getTotalLength());
//     }

//     else spot = (u * this.track.getTotalLength());

//     if (u >= 1) {
//       this.dir = -this.dir;
//       // console.warn('this.dir', this.dir);
//     }

//     const p = this.track.getPointAtLength(spot);


//     this.sprite.setAttribute("transform", `translate(${p.x}, ${p.y})`);
//     const frequency = 100 + p.y * 2;
//   
//    if (this.audio) {
//       this.audio.oscillator.frequency.value = frequency;
//     }

//     this.sprite.dispatchEvent(new CustomEvent('frequencychange', { bubbles: true, detail: { dotY: p.y, frequency } }))
//   },
// };


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


// window.onload = () => {
//   dot.init('dot', 'curve');
//   anim.start(2000);
// }

console.log({ dot });