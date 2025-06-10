import { draggable } from 'https://hamilsauce.github.io/hamhelper/draggable.js';
import { Point } from './Point.js';
import { SvgPath } from './SvgPath.js';
// import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
// const { date, array, utils, text } = ham;
import { getPendulumStore } from '../store/pendulum/pendulum.store.js';
import { updateVertex, updateControl, updateFrequencyDot } from '../store/pendulum/pendulum.actions.js';

const { combineLatest, forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { takeUntil, sampleTime, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const SVG_NS = 'http://www.w3.org/2000/svg';




const createText = (value, parent) => {
  const textNode = document.createElementNS(SVG_NS, "text");
  const text = document.createTextNode(value);
  textNode.appendChild(text);
  textNode.classList.add('text-node');
  textNode.setAttributeNS(null, 'text-anchor', 'middle');
  textNode.setAttribute('x', 0.5);
  textNode.setAttribute('y', 0.6);

  textNode.setAttribute('transform', 'translate(0,0)');
  parent.prepend(textNode);

  return textNode;
};

export const InitialPoints = {
  'path-point-0': Point.create(-50, 0),
  'path-point-1': Point.create(0, 0),
  'path-point-2': Point.create(50, 0),
  'control-point-0': Point.create(-35, -50),
  'control-point-1': Point.create(-15, -50),
  'control-point-2': Point.create(25, 50),
};

const pendulumStore = getPendulumStore();

export class SvgCanvas {
  #dir;
  #track;
  #sprite;

  constructor(el, options = {}) {
    this.self = el;
    this.pointerTarget;
    this.setViewport();

    window.onresize = this.setViewport.bind(this);

    this.boundPost = this.post.bind(this);

    this.state = {
      objectRegistry: new Map(),
      eventPoint$: new Subject(),
    };

    this.eventResponses$ = new Subject();

    this.pointerDown$ = fromEvent(this.self, 'pointerdown').pipe(
      filter(_ => _.target.dataset.pointGroup),
    );

    this.pointerMove$ = fromEvent(document, 'pointermove')
       .pipe(
        // tap(x => console.log('pointerMove$', x)),
      );


    this.pointerUp$ = fromEvent(document, 'pointerup')
      .pipe(
        tap(x => this.pointerTarget = null),
      );

    this.pointerEvents$ = this.pointerDown$.pipe(
      tap(x => this.pointerTarget = x.target),
      mergeMap((downEvent) => this.pointerMove$
        .pipe(
          takeUntil(this.pointerUp$),
          map(({ clientX, clientY }) => ({ target: this.pointerTarget, x: clientX, y: clientY })),
          groupBy(_ => _.target.dataset.pointGroup),
        ),
      )
    );

    this.pathPoints$ = this.pointerEvents$.pipe(
      mergeMap(group$ => group$
        .pipe(
          tap(({ target, x, y }) => {
            const value = this.domPoint.bind(this)(target, x, y);

            const setName = target.closest('.control-set').dataset.controlSetName;

            const pointType = target.dataset.pointType;

            const line = target.closest('.control-set').querySelector('.control-line');


            if (!this.containsPoint(value)) {
              target.cx.baseVal.value = value.x;
              target.cy.baseVal.value = value.y;
            }

            if (pointType === 'vertex') {
              pendulumStore.dispatch(updateVertex({ x: value.x, y: value.y, vertex: setName }));
              line.x2.baseVal.value = value.x;
              line.y2.baseVal.value = value.y;
            } else {
              pendulumStore.dispatch(updateControl({ x: value.x, y: value.y, control: setName }));
              line.x1.baseVal.value = value.x;
              line.y1.baseVal.value = value.y;
            }
          }),
          map(({ target, x, y }) => ({
            [`${target.id}`]: this.domPoint(target, x, y)
          })),
        )
      ),
      scan((inputDict, input) => ({ ...inputDict, ...input })),
    );

    this.eventChannel = {
      events$: this.state.eventPoint$.pipe(map(e => ({ x: e.pageX, y: e.pageY }))),
      respond: this.boundPost
    };

    Object.assign(this, options);

    this.sceneLayer = this.self.querySelector('#scene');
    this.hudLayer = this.self.querySelector('#hud');
    this.surface = this.self.querySelector('#surface-layer');


    this.pathElement = this.self.querySelector('#curve');

    this.pathModel = SvgPath.createPath(this.pathElement, this.pathPoints$, InitialPoints);

    this.pathData$ = this.pathModel.connect().pipe(
      tap(x => this.pathElement.setAttribute('d', x)),
    );

    this.pathData$.subscribe();
  }

  get elements() { return [...this.objectRegistry.keys()]; }

  get objectRegistry() { return this.state.objectRegistry; }

  get children() { return [...this.self.children]; };

  get boundingBox() {
    return this.self.getBoundingClientRect();
  }

  static createCanvas(options) { return new SvgCanvas(document.createElement('svg'), options || {}); }

  static attachCanvas(el, options) {
    return new SvgCanvas(el, options || {});
  }

  containsPoint(p) {
    return (
      p.y >= this.boundingBox.top &&
      p.y < this.boundingBox.bottom &&
      p.x >= this.boundingBox.left &&
      p.x < this.boundingBox.right
    );
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

  update(x, y) {
    this.audio.oscillator.frequency.value = y * 2;
  }

  post(data) {
    this.eventResponses$.next(data);
  }

  getElementAtPoint(point) { }

  queryElements(selector, predicateFn) {
    return this.elements.find(predicateFn);
  }

  draw() { }

  domPoint(element, x, y) {
    return new DOMPoint(x, y).matrixTransform(
      element.getScreenCTM().inverse()
    );
  }

  setViewport() {
    this.self.setAttribute('width', this.self.parentElement ? this.self.parentElement.getBoundingClientRect().width : window.innerWidth);
    this.self.setAttribute('height', this.self.parentElement ? this.self.parentElement.getBoundingClientRect().height : window.innerHeight);
  }
}