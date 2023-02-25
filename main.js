import {
  anim,
  // anim2,
  dot,
  // dot2
} from './components/rx-pendulum.js';
import { AudioController } from './components/AudioController.js'
// import { SvgCanvas } from './components/SvgCanvas.js'
// import { canvas } from './script.js'
// console.log('canvas', canvas)
const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

let audio = new AudioController();

// let ctx = new AudioContext();

// const osc = new OscillatorNode(ctx, {
//   type: 'triangle',
//   frequency: 400,
// });

// const gain = new GainNode(ctx, {
//   gain: 0.2,
// });

// const osc2 = new OscillatorNode(ctx, {
//   type: 'sine',
//   frequency: 200,
// });

// const gain2 = new GainNode(ctx, {
//   gain: 0.5,
// });

// osc.connect(gain)
// gain.connect(ctx.destination)
// osc.start()

// osc2.connect(gain2)
// gain2.connect(ctx.destination)
// osc2.start()

// const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body');
const startPrompt = document.querySelector('#start-prompt');
const startButton = document.querySelector('#start-button');
// const canvasEl = document.querySelector('#canvas');
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
let frequency2$;

window.onload = () => {

  frequency$ = dot.init('dot', 'curve');
  // frequency2$ = dot2.init('dot2', 'curve');

  dot.frequency$
    .pipe(
      map(x => x),
      map(audio.setFrequency),
      // map(({ frequency }) => osc.frequency.value = (frequency + 100) * 2),
    )
    .subscribe();

  // dot2.frequency$
    // .pipe(
    //   // map(x => ({frequency: x.frequency  })),
    //   // tap(x => console.log('x', x)),
    //   // map(({ frequency }) => osc2.frequency.value = frequency),
    // )
    // .subscribe();

  anim.start(durationInput.value);
  // anim2.start(durationInput.value);
}

setTimeout(() => {
  console.log(' ', );
}, 1000)