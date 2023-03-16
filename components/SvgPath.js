import { Point } from './Point.js';
import { getPendulumStore } from '../store/pendulum/pendulum.store.js';

const { forkJoin, asObservable, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const Position = {
  abs: 'absolute',
  rel: 'relative',
}


const pendulumStore = getPendulumStore()


export class SvgPath {
  #data$;
  #positioning = Position.abs;

  constructor(pathElement, input$, initialData, options = {}) {
    this.self = pathElement;
    this.input$ = input$;

    this.inputSubscription = this.input$
      .pipe(
        tap(x => this.#data$.next(x))
      )
      .subscribe()

    this.#data$ = new BehaviorSubject(initialData)
      .pipe(
        scan((previousPoints, points) => ({
          ...previousPoints,
          ...points
        }), {}),
        map(this.updateCurve.bind(this)),
      );
  }

  get def() { return this.self.getAttribute('d') }

  set def(newValue) { this._def = newValue }

  get dataset() {
    return this.self.dataset
  }

  get boundingBox() {
    return this.self.getBoundingClientRect();
  }

  static createPath(pathElement, input$, initialData) { return new SvgPath(pathElement, input$, initialData) }

  updateCurve(pointDict = {}) {
    return `
      M ${this.getPointString(pointDict['path-point-0'])}
      C ${this.getPointString(pointDict['control-point-0'])} ${this.getPointString(pointDict['control-point-1'])} ${this.getPointString(pointDict['path-point-1'])}
      S ${this.getPointString(pointDict['control-point-2'])} ${this.getPointString(pointDict['path-point-2'])}
    `.trim();
  }


  connect() {
    return this.#data$.asObservable()
  }

  containsPoint(p) {
    return (
      p.y >= this.boundingBox.top &&
      p.y < this.boundingBox.bottom &&
      p.x >= this.boundingBox.left &&
      p.x < this.boundingBox.right
    )
  }

  domPoint(x, y) {
    return new DOMPoint(x, y).matrixTransform(
      this.self.ownerSVGElement.getScreenCTM().inverse()
    );
  }

  getPointString({ x, y }) {
    const pt = this.domPoint(x, y);

    return `${Math.round(x)},${Math.round(y)}`;
  }


  // moveTo({ x, y }, positioning = 'abs') {
  //   const cmd = positioning === 'abs' ? 'M' : 'm'
  //   const point = ` ${cmd} ${this.getPointString({x,y})}`

  //   return point;
  // }

  // cubic({ controlA, controlB, end }, positioning = 'abs') {
  //   const cmd = positioning === 'abs' ? 'C' : 'c';
  //   const point = ` ${cmd} ${this.getPointString(controlA)} ${this.getPointString(controlB)} ${this.getPointString(end)}`;

  //   return point;
  // }

  // LineTo() { ' L, l, H, h, V, v' }
  // Cubic() { 'Bézier Curve: C, c, S, s' }
  // Quadratic() { 'Bézier Curve: Q, q, T, t' }
  // Elliptical() { 'Arc Curve: A, a' }
  // ClosePath() { ' Z, z' }
}