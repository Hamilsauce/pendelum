import { App } from './app.js';
import { SvgCanvas } from './components/SvgCanvas.js';

const initApp = async () => {
  const canvas = await SvgCanvas.attachCanvas(document.querySelector('#canvas'));

  const app = new App();
};

setTimeout(async () => await initApp(), 0);