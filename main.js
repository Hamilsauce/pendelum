import { anim, dot } from './components/rx-pendulum.js';
import { AudioController } from './components/AudioController.js'
// import { SvgCanvas } from './components/SvgCanvas.js'
// import { canvas } from './script.js'
console.log('canvas', canvas)
const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

let context;
let audio
audio = new AudioController();
setTimeout(() => {
  console.log(' ', );
}, 200)


const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body');
const startPrompt = document.querySelector('#start-prompt');
const startButton = document.querySelector('#start-button');
const canvasEl = document.querySelector('#canvas');
const durationInput = document.querySelector('#duration-input');
const oscillatorSelect = document.querySelector('#oscillator-input');

const bodyBb = appBody.getBoundingClientRect()

startPrompt.style.left = `${(bodyBb.width / 2) - (startPrompt.getBoundingClientRect().width/2)}px`

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

setTimeout(() => {
  console.log(' ', );
}, 1000)