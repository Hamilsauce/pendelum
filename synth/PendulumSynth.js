import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { Point } from '../components/Point.js';
import { SvgPath } from '../components/SvgPath.js';
const { template, utils } = ham;

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;


export const InitialPoints = {
  vertices: [
    Point.create(-50, 0),
    Point.create(0, 0),
    Point.create(50, 0),
  ],
  controls: [
    Point.create(-35, -50),
    Point.create(-15, -50),
    Point.create(25, 50),
  ],
}



export class PendulumSynth extends AudioContext {
  #dot = null;
  #curve = null;
  #svg = null;

  constructor(svgContext) {
    super()

    this.#svg = svgContext
    this.self = this.#svg.querySelector('#pendulum-container');
  }

  // get prop() { return this.#prop };
  // set prop(v) { this.#prop = v };
}