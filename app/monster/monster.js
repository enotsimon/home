
import Util from "common/util";
import Interaction from "monster/interaction";
import MapDrawer from "monster/drawer";
import App from 'monster/components/app';
import ReactDOM from 'react-dom';
import React from 'react';

class Game {
  constructor() {
    // CONST
    this.width = 800;
    this.height = 800;

    this.drawer = new MapDrawer();
    this.interaction = new Interaction();
  }

  generate_world() {
    // global game state
    this.state = {};
    
    this.drawer.init(this.width, this.height);
    this.interaction.init();
  }
}

let game = new Game();
module.exports.game = game;

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.querySelector('#app'));
  game.generate_world();
});
