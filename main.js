'use strict';


const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 500;
const CANVAS_ID = "canvas";

const PLAYER_HEIGHT = 5;
const PLAYER_WIDTH = 50;
const PLAYER_ID = "player";

const BALL_HEIGHT = 30;
const BALL_WIDTH = 30;
const BALL_ID = "ball";

const TIMESTEP = 1000 / 60;
const V_BASE = 1;

const fuzzy = new FuzzyLogic();

const fuzzyRules = {
  variables_input: [
    {
      name: "altitude",
      setsName: [
        "ground",
        "low",
        "medium",
        "high"
      ],
      sets: [
        [0, 0, 0.2 * CANVAS_HEIGHT, 0.3 * CANVAS_HEIGHT],
        [0.2 * CANVAS_HEIGHT, 0.3 * CANVAS_HEIGHT, 0.35 * CANVAS_HEIGHT, 0.5 * CANVAS_HEIGHT],
        [0.45 * CANVAS_HEIGHT, 0.5 * CANVAS_HEIGHT, 0.70 * CANVAS_HEIGHT, 0.90 * CANVAS_HEIGHT],
        [0.80 * CANVAS_HEIGHT, 0.90 * CANVAS_HEIGHT, 1 * CANVAS_HEIGHT, 1 * CANVAS_HEIGHT]
      ]
    },
    {
      name: "position",
      setsName: [
        "far behind",
        "near behind",
        "above",
        "near ahead",
        "far ahead"
      ],
      sets: [
        [-1 * CANVAS_WIDTH, -1 * CANVAS_WIDTH, -0.6 * CANVAS_WIDTH, -0.4 * CANVAS_WIDTH],
        [-0.6 * CANVAS_WIDTH, -0.4 * CANVAS_WIDTH, -2 * PLAYER_WIDTH, -0.5 * PLAYER_WIDTH],
        [-0.5 * PLAYER_WIDTH, -0.5 * PLAYER_WIDTH, 0.5 * PLAYER_WIDTH, 0.5 * PLAYER_WIDTH],
        [0.5 * PLAYER_WIDTH, 2 * PLAYER_WIDTH, 0.4 * CANVAS_WIDTH, 0.6 * CANVAS_WIDTH],
        [0.4 * CANVAS_WIDTH, 0.6 * CANVAS_WIDTH, 1 * CANVAS_WIDTH, 1 * CANVAS_WIDTH]
      ]
    }
    // TODO velocity
  ],
  variable_output: {
    name: "velocity",
    setsName: [
      "halt",
      "slow",
      "fast"
    ],
    sets: [
      [0, 0, 0, 0],
      [0, 5, 5, 5],
      [0, 10, 10, 10]
    ].map(s => s.map(x => x * V_BASE))
  },
  inferences: [[0, 2, 2, 1], [2, 2, 0, 1, 2]]
};


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

  update(delta, state) {
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
    this.lastDecision = Date.now()
  }

  update(delta, state) {
    super.update(delta, state);
    this.decide(state);
  }

  decide(state) {
    console.log(this.lastDecision)
    if (this.lastDecision + 500 < Date.now()) {

      const rules = fuzzyRules;
      // console.log(rules)
      rules.crisp_input = [100, 70];
      console.log(fuzzy.getResult(rules));

      this.lastDecision = Date.now();
    }

  }

}


class Ball extends Object {
  constructor() {
    super();
    this.element = document.getElementById(BALL_ID);
    this.yb = PLAYER_HEIGHT * 2;
    this.xl = PLAYER_WIDTH * 2;
    this.vx = 0.1;
    this.vy = -0.15;
    this.width = BALL_WIDTH;
    this.height = BALL_HEIGHT;
  }

  update(delta, state) {
    super.update(delta, state);

    const player = state.player;

    if (this.xr >= player.xl && this.xl <= player.xr
      && this.yb <= player.yt) {
      this.vy = Math.abs(this.vy);
      state.incHits();
    }
  }
}

class Stats {
  constructor() {
    this.element = document.getElementById("stats");
    this.hits = 0;
  }

  draw() {
    this.element.textContent = `Hits: ${this.hits}`;
  }
}

class State {
  constructor() {
    this.player = new Player();
    this.ball = new Ball();
    this.stats = new Stats();
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
    this.stats.draw();
  }

  update(delta) {
    this.player.update(delta, this);
    this.ball.update(delta, this);
  }

  // increase hits count
  incHits() {
    this.stats.hits += 1;
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