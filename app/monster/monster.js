
import Util from "common/util";
import App from 'monster/components/app';
import ReactDOM from 'react-dom';
import React from 'react';

import mobiles from 'monster/config/mobiles';
import scenes from 'monster/config/scenes';

import { createStore } from 'redux';
import { Provider } from 'react-redux'
import root_reducer from './reducers';
import * as actions from './actions';

class Game {
  init_game() {
    this.config = {
      mobiles: mobiles,
      scenes: scenes,
      text: require('./text/rus.js').default,
    };
    
    this.store = createStore(root_reducer);

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
  }
}

const game = new Game();
game.init_game();
export default game;

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Provider store={game.store}>
      <App />
    </Provider>,
    document.querySelector('#app')
  );
});
