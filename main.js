'use strict';


const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 500;
const CANVAS_ID = "canvas";

const PLAYER_HEIGHT = 20;
const PLAYER_WIDTH = 50;
const PLAYER_ID = "player";

const TIMESTEP = 1000 / 60;


class Object {
  constructor() {
    this.xl = 0;
    this.yb = 0;
    this.vx = 0;
    this.vy = 0;
  }

  get xr() { return this.xl + this.width; }
  get yt() { return this.yb + this.height; }

  initialDraw() {
    this.element.style.width = this.width + 'px';
    this.element.style.height = this.height + 'px';
  }

  draw() {
    this.element.style.left = this.xl + 'px';
    this.element.style.bottom = this.yb + 'px';
  }
}

class Player extends Object {
  constructor() {
    super();
    this.element = document.getElementById(PLAYER_ID);
    this.vx = 0.01;
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
  }

  update(delta) {
    this.xl += this.vx * delta;
    this.yb += this.vy * delta;
  }

}

class State {
  constructor() {
    this.player = new Player();
  }

  initialDraw() {
    const canvas = document.getElementById(CANVAS_ID);
    canvas.style.width = CANVAS_WIDTH + 'px';
    canvas.style.height = CANVAS_HEIGHT + 'px';

    this.player.initialDraw();
  }

  draw() {
    this.player.draw();
  }

  update(delta) {
    this.player.update(delta);
  }
}



window.onload = function () {
  const state = new State();
  state.initialDraw();

  let delta = 0;
  let lastFrameTimeMs = 0;
  function mainLoop(timestamp) {
    delta += timestamp - lastFrameTimeMs
    lastFrameTimeMs = timestamp;
    while (delta > TIMESTEP) {
      state.update(TIMESTEP);
      delta -= TIMESTEP;
    }
    state.draw();
    requestAnimationFrame(mainLoop);
  }

  requestAnimationFrame(mainLoop);
}