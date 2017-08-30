
import Util from "util";
import StarSystem from "star_system";
import Interaction from "interaction";
import MapDrawer from "map_drawer";

import ReactDOM from 'react-dom';
import React from 'react';
import App from 'components/app';

class Game {
  constructor() {
    // CONST
    this.width = 800;
    this.height = 800;

    this.map_drawer = new MapDrawer();
    this.interaction = new Interaction();
  }

  generate_world() {
    this.star_system = new StarSystem();
    this.star_system.generate();

    this.ticks = 0;
    
    this.map_drawer.init(this.width, this.height);
    this.interaction.init();

    this.map_drawer.map.ticker.add(this.handle_tick.bind(this));

    this.map_drawer.init_graphics();
  }

  handle_tick() {
    this.ticks++;
    this.star_system.tick();
    this.map_drawer.redraw();
  }
}

let game = new Game();
module.exports.game = game;

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.querySelector('#app'));
  game.generate_world();
});
