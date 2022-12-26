import { dot, anim } from "./components/pendulum.js";
// import { SvgCanvas } from './components/SvgCanvas.js'
import { AudioController } from './components/AudioController.js'

// import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
// const { date, array, utils, text } = ham;

// const canvas = SvgCanvas.attachCanvas(document.querySelector('svg'))

const audio = new AudioController()
let context;

const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body')
const durin = document.querySelector('#time-input')

durin.value = 1000;

audio.attachOscillator(dot);
dot.audio.play();
dot.audio.gain.value = 1;


durin.addEventListener('change', e => {
  anim.duration = +durin.value
});


function init() {
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
  }
  catch (e) {
    alert('Web Audio API is not supported in this browser');
  }
}

// window.addEventListener('load', init, false);

window.onload = () => {
  dot.init('dot', 'curve');
  anim.start(durin.value);


  dot.sprite.addEventListener('frequencychange', e => {
    const { frequency } = e.detail
    // console.warn({ frequency });
  });

}