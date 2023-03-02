import { App } from './app.js';
const app = new App();

const appEl = document.querySelector('#app');
const appBody = document.querySelector('#app-body')
const containers = document.querySelectorAll('.container')

appEl.addEventListener('click', e => {

  console.log('e', e)
});