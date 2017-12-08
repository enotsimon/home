
import Util from "common/util";
import Interaction from "monster/interaction";
import MapDrawer from "monster/drawer";
import App from 'monster/components/app';
import ReactDOM from 'react-dom';
import React from 'react';

import mobiles from 'monster/config/mobiles';
import scenes from 'monster/config/scenes';

import { createStore } from 'redux';
import monster_app from './reducers';
import * as actions from './actions';

class Game {
  constructor() {
    this.drawer = new MapDrawer();
    this.interaction = new Interaction();
  }

  init_game() {
    this.menues = {
      main: {
        mobiles: [],
        furniture: [],
        links: [],
      },
    };
    this.config = {
      mobiles: mobiles,
      scenes: scenes,
    };
    // global game state
    this.state = {
      current_scene: "mage_room",
      money: {
        fishes: 0,
        foxes: 0,
      },
      clothes: {
        body: "dirty_dress",
      },
      inventory: [],
      flags: {},
    };
    
    this.drawer.init(this.width, this.height);
    this.interaction.init();
    this.change_scene(this.state.current_scene);

    let store = createStore(monster_app);
    const unsubscribe = store.subscribe(() =>
      console.log('state changed to', store.getState())
    );
    store.dispatch(actions.change_money_amount('fishes', 3));
  }

  change_scene(scene_name) {
    if (!this.config.scenes[scene_name]) {
      console.log('scene not found', scene_name);
      return false;
    }
    this.menues.main = {
      active: true,
      mobiles: this.config.scenes[scene_name].mobiles,
      furniture: this.config.scenes[scene_name].furniture,
      links: this.config.scenes[scene_name].links,
      // inventory
      // money
      // clothes
    };
    this.drawer.draw_scene(this.config.scenes[scene_name]);
    this.drawer.draw_main_menu(this.menues.main);
    this.interaction.init_actions_mode();
  }
}

let game = new Game();
module.exports.game = game;

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.querySelector('#app'));
  game.init_game();
});
