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

const TIMESTEP = 1000 / 30;
const V_BASE = 0.01;

const DECISION_INTERVAL_MS = 1000;

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
      name: "distance",
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
    },
    {
      name: "angle",
      setsName: [
        "horizontal",
        "low",
        "steep",
        "vertical",
      ],
      sets:
        [
          // 1 - vertical, 0 - horizontal
          // map() below converts to radians
          [0, 0, 0.1, 0.2],
          [0.1, 0.2, 0.4, 0.6],
          [0.4, 0.6, 0.8, 0.9],
          [0.8, 0.9, 1, 1]
        ].map(s => s.map(x => x * Math.PI / 2))
    }
  ],
  variable_output: {
    name: "velocity",
    setsName: [
      "halt",
      "slow",
      "fast",
      "very fast",
    ],
    sets: [
      [0, 0, 0, 0],
      [0, 3, 5, 5],
      [2, 10, 10, 10],
      [5, 20, 20, 20]
    ].map(s => s.map(x => x * V_BASE))
  },
  inferences: [[2, 3, 3, 1], [3, 3, 0, 0, 2], [3, 2, 1, 0]]
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
  get xm() { return (this.xl + this.xr) / 2; }
  get ym() { return (this.yb + this.yt) / 2; }

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
    if (this.lastDecision + DECISION_INTERVAL_MS < Date.now()) {
      const rules = fuzzyRules;
      const { ball, stats } = state;

      let distance = (state.ball.xm - this.xm);
      distance = Math.sign(distance * this.vx) * Math.abs(distance);
      const angle = Math.atan(Math.abs(ball.vy / ball.vx));

      rules.crisp_input = [state.ball.yb, distance, angle];
      console.log('input: ', rules.crisp_input);
      state.stats.params.Distance = distance;
      state.stats.params.Angle = (angle / Math.PI).toFixed(3) + 'π';
      state.stats.params.Altitude = state.ball.yb;

      // add minor value to never allow 0
      const result = fuzzy.getResult(rules) + V_BASE * 0.001;

      console.log(result);
      this.vx = (this.vx >= 0 ? 1 : -1) * result;
      stats.params.Velocity = this.vx;

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
    this.vx = 8 * V_BASE;
    this.vy = 12 * V_BASE;
    this.width = BALL_WIDTH;
    this.height = BALL_HEIGHT;
  }

  update(delta, state) {
    super.update(delta, state);

    const player = state.player;

    if (this.xr >= player.xl && this.xl <= player.xr
      && this.yb <= player.yt) {
      this.vy = Math.abs(this.vy + 0.1 * player.vx);

      state.incHits();
    }
  }
}

class Stats {
  constructor() {
    this.element = document.getElementById("stats");
    this.params = {};
  }

  draw() {
    let tableStr = "<table>";
    console.log(this.params)
    for (let prop in this.params) {
      const value = this.params[prop];
      let formatted;
      if (Number.isInteger(value) || isNaN(value)) {
        formatted = value;
      } else {
        formatted = value.toFixed(4);
      }
      tableStr += `<tr><td>${prop}</td><td>${formatted}</td></tr>`
    }
    tableStr += "</table>";

    this.element.innerHTML = tableStr;
  }
}

class State {
  constructor() {
    this.player = new Player();
    this.ball = new Ball();
    this.stats = new Stats();
    this.stats.params.Hits = 0;
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
    this.stats.params.Hits += 1;
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