export class CurvePath {
  constructor() {
    this.root;
  };
  get prop() { return this.#prop };
  set prop(v) { this.#prop = v };
}