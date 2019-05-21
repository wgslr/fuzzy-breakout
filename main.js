'use strict';


const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 500;
const CANVAS_ID = "canvas";

const PLAYER_HEIGHT = 20;
const PLAYER_WIDTH = 50;
const PLAYER_ID = "player";


class Player {
  constructor() {
    this.element = document.getElementById(PLAYER_ID);
    this.x1 = 0;
    this.x2 = this.x1 + PLAYER_WIDTH;
    this.y = PLAYER_HEIGHT;
    this.velocity = 10;
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
}


window.onload = function () {
  const state = new State();
  state.initialDraw();
  state.draw();
}