// import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
// const { template, utils, rxjs } = ham;
import { getPendulumStore } from '../store/pendulum/pendulum.store.js';
import { updateVertex, updateControl, updateFrequencyDot } from '../store/pendulum/pendulum.actions.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;

const { sampleTime, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

const pendulumStore = getPendulumStore()

const frequencyState$ = pendulumStore
  .select(state => state.frequencyDot)
  .pipe()
  .subscribe();



const easeInOut = t => (t < 0.5) ?
  (2 * t * t) :
  (-1 + (4 - 2 * t) * t);


const getVelocityFromY = (y) => {
  const minY = -100,
    maxY = 100;
  const normalizedY = (y - minY) / (maxY - minY);
  
  // Invert so high y => slow
  const scalar = 1 - normalizedY;
  
  // Prevent stall
  return Math.max(0.02, scalar);
}

class FrequencyDot_old {
  #sprite = null;
  #track = null;
  #dir = -1;
  #positionSubject$;
  #frequencySubject$;
  #frequency$
  
  constructor(initDir = -1) {
    this.isStarted = false;
    this.isHolding = false;
    this.lastY = 0;
    
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
    this.lastY = p.y
    
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
    if (this.isStarted === true) {
      const point = this.getPointOnTrack(u);
      this.lastY = point.y;
      
      this.#positionSubject$.next(u);
    }
  }
  
  hold() {
    this.isHolding = false;
  }
}

class FrequencyDot {
  #sprite = null;
  #track = null;
  #dir = -1;
  #positionSubject$;
  #frequencySubject$;
  #frequency$;
  
  constructor(initDir = -1) {
    this.isStarted = false;
    this.isHolding = false;
    this.lastY = 0;
    
    this.#frequencySubject$ = new BehaviorSubject({ frequency: 150 });
    this.#dir = initDir;
    
    this.#frequency$ = this.#frequencySubject$.asObservable();
    this.init = this.#init.bind(this);
    
    this.#positionSubject$ = new BehaviorSubject(0).pipe(
      map(this.getPointOnTrack.bind(this)),
      tap(({ x, y }) => {
        // this.lastY = y; // ← Track y position cleanly here
        pendulumStore.dispatch(updateFrequencyDot({ x: -x, y: -y }));
      }),
      map(this.translateToPoint.bind(this)),
      map(this.getFrequency.bind(this)),
    );
  }
  
  get frequency$() {
    return this.#frequency$;
  }
  
  #init(spriteSelector, trackSelector) {
    this.#sprite = document.getElementById(spriteSelector);
    this.#track = document.getElementById(trackSelector);
    
    this.#positionSubject$.subscribe(this.#frequencySubject$);
    this.isStarted = true;
    
    return this.frequency$;
  }
  
  getPointOnTrack(u) {
    const trackLen = this.#track.getTotalLength();
    const spot = this.#dir > 0 ?
      trackLen - (u * trackLen) :
      u * trackLen;
    
    // console.warn('trackLen', trackLen)
    
    if (u >= 1) this.#dir *= -1;
    
    const p = this.#track.getPointAtLength(spot);
    this.lastY = p.y
    return p
  }
  
  translateToPoint(pt = new DOMPoint()) {
    this.#sprite.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
    return pt;
  }
  
  // getFrequency(pt = new DOMPoint()) {
  //   return { frequency: (100 + pt.y) * 2 };
  // }
  
  // Use exponential scale
  getFrequency(pt) {
    const norm = clamp((pt.y + 100) / 200, 0, 1); // map y to [0,1]
    const freq = 40 * Math.pow(2, norm * 5); // ~40Hz to ~1280Hz
    return { frequency: freq };
  };
  
  
  move(u) {
    if (this.isStarted) {
      this.#positionSubject$.next(u);
    }
  }
  
  hold() {
    this.isHolding = false;
  }
}


export const dot = new FrequencyDot();

export const anim_time_shifter = {
  isHolding: false,
  frameId: null,
  lastU: 0,
  direction: 1,
  duration: 4000, // total time to traverse from 0 ➡️ 1 (or back)
  
  start(duration) {
    this.duration = duration || this.duration;
    this.tZero = performance.now();
    this.lastU = this.direction > 0 ? 0 : 1;
    this.frameId = requestAnimationFrame(this.run.bind(this));
  },
  
  run(now) {
    if (this.isHolding) {
      this.frameId = requestAnimationFrame(this.run.bind(this));
      return;
    }
    
    const elapsed = now - this.tZero;
    
    const y = Math.max(0, dot.lastY || 0);
    
    const velocityMod = 1 / (1 + y * 0.005); // Y slows down progress
    const adjustedElapsed = elapsed * velocityMod;
    
    let u = adjustedElapsed / this.duration;
    
    if (u >= 1) {
      // Reached end of current direction — flip and restart from *other* side
      this.direction *= -1;
      this.tZero = now; // Reset animation clock
      this.lastU = this.direction >= 0 ? 0 : 1;
      this.frameId = requestAnimationFrame(this.run.bind(this));
      return;
    }
    
    const directedU = this.direction >= 0 ? u : 1 - u;
    
    dot.move(directedU);
    this.lastU = directedU;
    
    this.frameId = requestAnimationFrame(this.run.bind(this));
  },
  
  stop() {
    cancelAnimationFrame(this.frameId);
  },
  
  toggleHold(state) {
    this.isHolding = typeof state === 'boolean' ? state : !this.isHolding;
  }
};


export const anim = {
  isHolding: false,
  frameId: null,
  lastU: null,
  
  start: function(duration) {
    this.duration = duration || this.duration;
    this.tZero = this.tZero || Date.now();
  
    this.frameId = requestAnimationFrame(() => this.run());
  },
  
  startGPT: function(duration) { 
    this.duration = duration || this.duration;
    this.tZero = Date.now();
    this.frameId = requestAnimationFrame(() => this.run());
  },
  
  run: function() {
    let u = this.isHolding === true ? this.lastU : Math.min((Date.now() - this.tZero) / this.duration, 1);
  
    const baseTime = (Date.now() - this.tZero) / this.duration;
  
    // Use latest dot.y to compute velocity scaling
    const y = dot.lastY;
    const velocity = getVelocityFromY(y); // e.g., map high y => slow
    // console.warn('velocity', velocity)
  
    // Scale u step size by velocity
    const delta = baseTime * velocity;
    // let u = this.isHolding === true ? this.lastU : Math.min(this.lastU + delta, 1);
  
  
  
    if (u < 1) {
      this.frameId = requestAnimationFrame(() => this.run());
    } else {
      this.onFinish();
    }
  
    // let easedU = easeInOut(u);
  
    dot.move(u);
  
    this.lastU = u;
  },
  
  // runGPT: function() {
  //   const t = Date.now() - this.tZero;
    
  //   // Oscillates u ∈ [0, 1] using a sine wave (smooth pendulum motion)
  //   const u = 0.5 + 0.5 * Math.sin((t / this.duration) * 2 * Math.PI);
    
  //   dot.move(u); // Move dot to corresponding point on track
    
  //   this.lastU = u;
    
  //   this.frameId = requestAnimationFrame(() => this.run());
  // },
  
  
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