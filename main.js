import { App } from './app.js';
import { SvgCanvas } from './components/SvgCanvas.js';



const canvas = await SvgCanvas.attachCanvas(document.querySelector('#canvas'));
const app = new App();

// const appEl = document.querySelector('#app');
// const appBody = document.querySelector('#app-body')
// const containers = document.querySelectorAll('.container')