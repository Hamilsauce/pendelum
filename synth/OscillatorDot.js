const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export const OscillatorDotOptions = {
  templateName: '#oscillator-dot-template',
  direction: -1,
  OscillatorOptions: {
    frequency: 440,
    type: 'triangle'
  }
};

export class OscillatorDot extends OscillatorNode {
  #sprite = null;
  #track = null;
  #direction = -1;
  #positionSubject$;
  #frequencySubject$;
  #frequency$

  #self = null;

  constructor(context, options = OscillatorDotOptions) {
    super(context, options.OscillatorOptions);
    this.#self = document.getElementById(spriteSelector);

    this.#direction = initDir;
  
    this.#frequencySubject$ = new BehaviorSubject({ frequency: 150 })
    this.#frequency$ = this.#frequencySubject$.asObservable();
  
    this.#positionSubject$ = new BehaviorSubject(0).pipe(
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

  // getPointOnTrack(u) {
  //   let spot;

  //   if (this.#direction > 0) {
  //     spot = this.#track.getTotalLength() - (u * this.#track.getTotalLength());
  //   }

  //   else spot = (u * this.#track.getTotalLength());

  //   if (u >= 1) {
  //     this.#direction = -this.#direction;
  //   }

  //   const p = this.#track.getPointAtLength(spot);

  //   return p;
  // }

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