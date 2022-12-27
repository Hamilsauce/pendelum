import { anim, dot } from './components/rx-pendulum.js';
import { AudioController } from './components/AudioController.js'

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

let context;
const audio = new AudioController();

const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body');
const startButton = document.querySelector('#start-button');
const canvas = document.querySelector('#canvas');
const durationInput = document.querySelector('#duration-input');
const oscillatorSelect = document.querySelector('#oscillator-input');

canvas.setAttribute('height', canvas.parentElement.getBoundingClientRect().height)


durationInput.value = 1000;

startButton.addEventListener('click', e => {
  audio.play();
startButton.parentElement.remove();
});

durationInput.addEventListener('change', e => {
  anim.duration = +durationInput.value;
});

oscillatorSelect.addEventListener('change', e => {
  const sel = oscillatorSelect.selectedOptions.item(0).value;
  audio.setType({ type: sel });
});

let frequency$;

window.onload = () => {
  frequency$ = dot.init('dot', 'curve');

  dot.frequency$
    .pipe(
      map(x => x),
      map(audio.setFrequency),
    )
    .subscribe();

  anim.start(durationInput.value);
}