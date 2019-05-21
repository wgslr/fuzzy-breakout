'use strict';


const CANVAS_HEIGHT = 300;
const CANVAS_WIDTH = 300;
const CANVAS_ID = "canvas";

const PLAYER_HEIGHT = 20;
const PLAYER_WIDTH = 50;
const PLAYER_ID = "player";

const BALL_HEIGHT = 30;
const BALL_WIDTH = 30;
const BALL_ID = "ball";

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

  update(delta) {
    this.xl += this.vx * delta;
    this.yb += this.vy * delta;

    if (this.xl <= 0) {
      this.vx = Math.abs(this.vx);
    } else if (this.xr >= CANVAS_WIDTH) {
      this.vx = -Math.abs(this.vx);
    }
    if (this.yb <= 0) {
      this.vy = Math.abs(this.vy);
    } else if (this.yt >= CANVAS_HEIGHT) {
      this.vy = -Math.abs(this.vy);
    }
  }

}

class Player extends Object {
  constructor() {
    super();
    this.element = document.getElementById(PLAYER_ID);
    this.vx = 0.05;
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
  }
}


class Ball extends Object {
  constructor() {
    super();
    this.element = document.getElementById(BALL_ID);
    this.vx = -0.05;
    this.vy = -0.1;
    this.width = BALL_WIDTH;
    this.height = BALL_HEIGHT;
  }
}

class State {
  constructor() {
    this.player = new Player();
    this.ball = new Ball();
  }

  initialDraw() {
    const canvas = document.getElementById(CANVAS_ID);
    canvas.style.width = CANVAS_WIDTH + 'px';
    canvas.style.height = CANVAS_HEIGHT + 'px';

    this.player.initialDraw();
    this.ball.initialDraw();
  }

  draw() {
    this.player.draw();
    this.ball.draw();
  }

  update(delta) {
    this.player.update(delta);
    this.ball.update(delta);
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