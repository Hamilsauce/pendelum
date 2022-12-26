// import { dot, anim } from "./components/pendulum.js";
// import { dot, anim } from "./components/rx-pendulum.js";
import { anim, dot } from './components/rx-pendulum.js';
import { AudioController } from './components/AudioController.js'

// import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
// const { date, array, utils, text } = ham;

// const canvas = SvgCanvas.attachCanvas(document.querySelector('svg'))

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

let context;
const audio = new AudioController()

const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body')
const durin = document.querySelector('#duration-input')
const oscillatorSelect = document.querySelector('#oscillator-input')

durin.value = 1000;

// audio.attachOscillator(dot);
// dot.audio.play();
// dot.audio.gain.value = 1;


durin.addEventListener('change', e => {
  anim.duration = +durin.value
});

oscillatorSelect.addEventListener('change', e => {
  const sel = oscillatorSelect.selectedOptions.item(0).value
  console.log('sel', sel)
});


// function init() {
//   try {
//     // Fix up for prefixing
//     window.AudioContext = window.AudioContext || window.webkitAudioContext;
//     context = new AudioContext();
//   }
//   catch (e) {
//     alert('Web Audio API is not supported in this browser');
//   }
// }

// window.addEventListener('load', init, false);

let frequency$;

window.onload = () => {
  frequency$ = dot.init('dot', 'curve');

  audio.play()
  dot.frequency$
    .pipe(
      map(x => x),
      map(audio.setFrequency),
    )
    .subscribe();

  anim.start(durin.value);


  // dot.sprite.addEventListener('frequencychange', e => {
  //   const { frequency } = e.detail
  //   console.warn({ frequency });
  // });

}