import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
const { template, DOM, utils } = ham;

export class DialKnob extends EventEmitter {
  #self;
  #name;
  #pointer;
  
  constructor() {
    super();
    this.#self = template('dial-knob');
    this.#pointer = document.getElementById("pointer");
    this.dialValue = document.getElementById("dial-value");
    this.self.firstElementChild.addEventListener('click', e => {
      this.toggleIcons()
    });
    
    this.#name = name;
  }
  
  get self() { return this.#self };
  
  get dataset() { return this.self.dataset };
  
  get textContent() { return this.self.textContent };
  
  set textContent(v) { this.dom.textContent = v }
  
  get id() { return this.#self.id };
  
  get dom() { return this.#self };
  
  get name() { return this.#name };
  
}


setTimeout(() => {
  
  const knob = document.getElementById("knob");
  const pointer = document.getElementById("pointer");
  const dialValue = document.getElementById("dial-value");
  
  // The knob’s SVG center (matches the circle’s center).
  const centerX = 50;
  const centerY = 50;
  
  let isDragging = false;
  let currentAngle = 0; // The knob’s current rotation (in degrees)
  let offset = 0; // Difference between currentAngle and the pointer’s absolute angle at pointerdown
  let lastUnwrappedAngle = 0; // A continuously tracked pointer angle (in degrees)
  
  // Helper: Set the rotation of the pointer and update currentAngle.
  function setRotation(angle) {
    pointer.setAttribute("transform", `rotate(${angle} ${centerX} ${centerY})`);
    currentAngle = angle;
    
    const perc = (currentAngle / 350) * 10
    dialValue.textContent = Math.round(perc)
  }
  
  // Computes an absolute angle (in degrees) from the center to the pointer position.
  // The calculation uses the standard transformation so that 0° is at the top,
  // 90° at the right, 180° at the bottom, and 270° at the left.
  // (The result is normalized to [0, 360).)
  function getPointerAngle(e) {
    const bbox = knob.getBoundingClientRect();
    // Convert client coordinates into SVG-local coordinates.
    const x = e.clientX - bbox.left;
    const y = e.clientY - bbox.top;
    // Math.atan2 returns an angle (in radians) relative to the positive x‑axis.
    // Adding 90° makes “top” (where y is smallest) equal to 0°.
    let angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
    // Normalize into [0, 360)
    angle = (angle + 360) % 360;
    return angle;
  }
  
  // On pointerdown, record the pointer’s absolute angle and
  // compute an offset so that the knob’s rotation doesn’t jump.
  knob.addEventListener("pointerdown", (e) => {
    isDragging = true;
    const angle = getPointerAngle(e);
    // Compute an offset so that when dragging begins the knob stays where it is.
    offset = currentAngle - angle;
    // Use the raw (absolute) computed angle as the starting unwrapped angle.
    lastUnwrappedAngle = angle;
    // Capture pointer events so we keep receiving events even if the pointer leaves the knob.
    knob.setPointerCapture(e.pointerId);
  });
  
  // On pointermove, update the knob rotation.
  document.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    let raw = getPointerAngle(e);
    // If the raw value “jumps” across 0 (or 360), adjust it relative to the last unwrapped angle.
    if (raw < lastUnwrappedAngle - 180) {
      raw += 360;
    } else if (raw > lastUnwrappedAngle + 180) {
      raw -= 360;
    }
    // Update the continuous (unwrapped) pointer angle.
    lastUnwrappedAngle = raw;
    // Calculate the new knob rotation by adding the offset.
    let newRotation = offset + raw;
    // Clamp the rotation between 0° (minimum) and 350° (maximum).
    newRotation = Math.max(0, Math.min(newRotation, 350));
    setRotation(newRotation);
  });
  
  // End dragging on pointerup or pointercancel.
  document.addEventListener("pointerup", (e) => {
    isDragging = false;
    knob.releasePointerCapture(e.pointerId);
  });
  knob.addEventListener("pointercancel", (e) => {
    isDragging = false;
    knob.releasePointerCapture(e.pointerId);
  });
  console.log(' ', );
}, 1000)