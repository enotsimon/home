
import Util from "common/util";
import Interaction from "monster/interaction";
import MapDrawer from "monster/drawer";
import App from 'monster/components/app';
import ReactDOM from 'react-dom';
import React from 'react';

import mobiles from 'monster/config/mobiles';
import scenes from 'monster/config/scenes';

import { createStore } from 'redux';
import root_reducer from './reducers';
import * as actions from './actions';

class Game {
  constructor() {
    this.drawer = new MapDrawer();
    this.interaction = new Interaction();
  }

  init_game() {
    this.config = {
      mobiles: mobiles,
      scenes: scenes,
    };
    
    this.store = createStore(root_reducer);
    this.drawer.init(this.width, this.height);
    this.interaction.init();

    /*const unsubscribe = this.store.subscribe(() =>
      console.log('state changed to', this.store.getState())
    );*/
    //this.store.dispatch(actions.change_money_amount('fishes', 3));

    this.change_scene('mage_room');
  }


  change_scene(scene_name) {
    let target_scene = game.config.scenes[scene_name];
    let current_scene = game.config.scenes[this.store.getState().current_scene_name];
    if (!target_scene) {
      this.store.dispatch(actions.error_change_scene_unknown_scene(scene_name));
      return false;
    }
    // current_scene can be null -- on game init
    if (current_scene && current_scene.links.indexOf(target_scene.name) == -1) {
      this.store.dispatch(actions.error_change_scene_not_linked_scene(scene_name));
      return false;
    }

    this.store.dispatch(actions.change_scene(scene_name));
    // it has changed! dont forget it!
    current_scene = game.config.scenes[this.store.getState().current_scene_name];
    this.store.dispatch(actions.rebuild_main_menu(current_scene));

    //this.drawer.draw_scene(this.config.scenes[scene_name]);
    //this.drawer.draw_main_menu(this.menues.main);
    //this.interaction.init_actions_mode();
  }
}

let game = new Game();
module.exports.game = game;

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.querySelector('#app'));
  game.init_game();
});
