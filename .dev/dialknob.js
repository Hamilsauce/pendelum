const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

const domPoint = (svg, x, y) => {
  return new DOMPoint(x, y).matrixTransform(
    svg.getScreenCTM().inverse()
  );
}


const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body')
const svg = document.querySelector('svg');
const dialKnob = document.querySelector('.dial-knob');

dialKnob.querySelector('.dial').setAttribute('transform', `rotate(${-135})`);


let currentRotation = 0;


const pointerDown$ = fromEvent(dialKnob.querySelector('.knob'), 'pointerdown').pipe(
  map(({ target, clientX, clientY }) => ({ target: target, x: clientX, y: clientY })),
);

const pointerMove$ = fromEvent(svg, 'pointermove').pipe(
  map(({ target, clientX, clientY }) => ({ target: target, x: clientX, y: clientY })),
);

const pointerUp$ = fromEvent(svg, 'pointerup').pipe(
  map(({ target, clientX, clientY }) => ({ target: target, x: clientX, y: clientY })),
);


const pointerEvents$ = pointerDown$.pipe(
  map(({ x, y }) => domPoint(svg, x, y)),
  switchMap(startPoint => pointerMove$
    .pipe(
      map(({ x, y }) => domPoint(svg, x, y)),
      scan((prev, curr) => {
        const delta = {
          x: Math.floor(curr.x - (prev.x - curr.x)),
          y: Math.floor(curr.y - (prev.y - curr.y)),
        }

        let deg = prev.deg;

        const isDialingOverMax = prev.deg >= 135 && (delta.x > 0)
        const isDialingUnderMin = prev.deg <= -135 && (delta.x<0)
        // console.log('isDialingOverMax', isDialingOverMax)
        // console.log('isDialingUnderMin', isDialingUnderMin)
        // console.log('prev.deg', prev.deg)
        if (isDialingOverMax || isDialingUnderMin) {
          deg = prev.deg
        } else {
          deg = delta.x > 0 ? prev.deg + 9 : delta.x < 0 ? prev.deg - 9 : prev.deg;

        }

        return { ...delta, deg }
      }, { x: 0, y: 0, deg: currentRotation }),
      tap(({ deg }) => {
        // dialKnob.querySelector('.dial-knob').setAttribute('transform', `rotate(${deg})`);
        dialKnob.setAttribute('transform', `rotate(${deg})`);
        dialKnob.querySelector('.dial-value').innerHTML = deg;
      }),
      tap(x => console.log('[[  VALUE  ]]', (x.deg / 360) * 100) + 105),
      switchMap(movePoint => pointerUp$
        .pipe(
          tap(() => {
            currentRotation = movePoint.deg
          }),
        )
      )
    )
  )
);

pointerEvents$.subscribe();