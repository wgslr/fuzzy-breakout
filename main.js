'use strict';


const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 500;
const CANVAS_ID = "canvas";

const PLAYER_HEIGHT = 20;
const PLAYER_WIDTH = 50;
const PLAYER_ID = "player";

const TIMESTEP = 1000 / 60;

class Player {
  constructor() {
    this.element = document.getElementById(PLAYER_ID);
    this.x1 = 0;
    this.y = PLAYER_HEIGHT;
    this.velocity = 10/1000;
  }

  initialDraw() {
    this.element.style.width = PLAYER_WIDTH + 'px';
    this.element.style.height = PLAYER_HEIGHT + 'px';
  }

  draw() {
    const elem = document.getElementById(PLAYER_ID)
    elem.style.left = this.x1 + 'px';
    elem.style.bottom = (this.y - PLAYER_HEIGHT) + 'px';
  }

  update(delta) {
    this.x1 += this.velocity * delta;
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