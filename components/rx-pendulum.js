// import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
// const { template, utils, rxjs } = ham;
import { getPendulumStore } from '../store/pendulum/pendulum.store.js';
import { updateVertex, updateControl, updateFrequencyDot } from '../store/pendulum/pendulum.actions.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;

const { sampleTime, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

const pendulumStore = getPendulumStore()

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}


const frequencyState$ = pendulumStore.select(state => state.frequencyDot).pipe(
  // map(x => x),
  // tap(x => console.warn('pendulumStore', x))
).subscribe()


let FREQUENCIES = []
let counter = 0
// const copyTextToClipboard = async (text) => {
//   await navigator.clipboard.writeText(text);
// };


class FrequencyDot {
  #sprite = null;
  #track = null;
  #dir = -1;
  #positionSubject$;
  #frequencySubject$;
  #frequency$
  
  constructor(initDir = -1) {
    this.isStarted = false;
    this.isHolding = false;
    
    this.#frequencySubject$ = new BehaviorSubject({ frequency: 150 })
    
    this.#dir = initDir;
    
    this.#frequency$ = this.#frequencySubject$.asObservable();
    this.init = this.#init.bind(this);
    this.#positionSubject$ = new BehaviorSubject(0)
      .pipe(
        map(this.getPointOnTrack.bind(this)),
        // tap(({ x, y }) => pendulumStore.dispatch(updateFrequencyDot({ x, y }))),
        tap(({ x, y }) => pendulumStore.dispatch(updateFrequencyDot({ x: -x, y: -y }))),
        map(this.translateToPoint.bind(this)),
        map(this.getFrequency.bind(this)),
      );
  }
  
  get frequency$() { return this.#frequency$ }
  
  #init(spriteSelector, trackSelector) {
    this.#sprite = document.getElementById(spriteSelector);
    this.#track = document.getElementById(trackSelector);
    
    this.#positionSubject$.subscribe(this.#frequencySubject$)
    this.isStarted = true;
    
    const pathLength = this.#track.getTotalLength()
    const middle = this.#track.getPointAtLength(this.#track.getTotalLength() / 2)
    return this.frequency$;
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
  
  getFrequency2(pt = new DOMPoint()) {
    const frequency = (100 + pt.y) * 2;
    
    return { frequency };
  }
  
  // Use exponential scale
  getFrequency(pt = new DOMPoint()) {
    const norm = clamp((pt.y + 100) / 200, 0, 1); // map y to [0,1]
    const freq = 40 * Math.pow(2, norm * 5); // ~40Hz to ~1280Hz
    
    const myfreq = (100 + pt.y) * 2;
   
    // FREQUENCIES.push({
    //   myfreq,
    //   freq,
    //   diff: freq - myfreq,
    //   time: performance.now(),
    //   id: counter,
    // })
    
    return { frequency: freq };
  };
  
  move(u) {
    if (this.isStarted === true) {
      this.#positionSubject$.next(u);
    }
  }
  
  hold() {
    this.isHolding = false;
  }
}

export const dot = new FrequencyDot();

export const anim = {
  isHolding: false,
  frameId: null,
  lastU: null,
  
  start: function(duration) {
    this.duration = duration || this.duration;
    this.tZero = this.tZero || Date.now();
    
    this.frameId = requestAnimationFrame(() => this.run());
  },
  
  run: function() {
    let u = this.isHolding === true ? this.lastU : Math.min((Date.now() - this.tZero) / this.duration, 1);
    
    if (u < 1) {
      this.frameId = requestAnimationFrame(() => this.run());
    } else {
      this.onFinish();
    }
    
    dot.move(u);
    
    this.lastU = u;
  },
  
  stop: function() {
    cancelAnimationFrame(this.frameId);
  },
  
  toggleHold: function(state) {
    this.isHolding = state ? state : !this.isHolding;
  },
  
  onFinish: function() {
    this.tZero = null;
    this.start(this.duration);
  }
};