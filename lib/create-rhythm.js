const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { bufferCount, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export const bar1  = interval(1000)
export const beats4 = interval(250)
.pipe(
    bufferCount(4),
    tap(x => console.log('BEAT', x))
  )
  
  
bar1.pipe(
    map(x => x),
    tap(x => console.log('BAR', x)),
    switchMap(() => beats4
    .pipe(
    map(x => x),
    tap(x => console.log('TAP', x))
 ))
  )
  .subscribe()