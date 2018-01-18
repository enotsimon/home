
import Util from "common/util";
import App from 'monster/components/app';
import ReactDOM from 'react-dom';
import React from 'react';

import mobiles from 'monster/config/mobiles';
import scenes from 'monster/config/scenes';
import dialogs from 'monster/config/dialogs';

import { createStore } from 'redux';
import { Provider } from 'react-redux'
import root_reducer from './reducers';
import * as actions from './actions';

class Game {
  init_game() {
    this.config = {
      mobiles,
      scenes,
      dialogs,
      text: require('./text/rus.js').default,
    };
    
    this.store = createStore(root_reducer);

    actions.bound_change_scene('mage_room');
  }
}

const game = new Game();
export default game;
// do it after export!!!
game.init_game();

// i hate this code
let show_hide_block_phases_spec = {
  show_scene_phases: ["idle", "dialog", "inspect"],
  show_dialog_phases: ["dialog"],
  show_main_menu_phases: ["idle", "inspect"],
  show_furniture_phases: ["inspect"],
};

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Provider store={game.store}>
      <App {...show_hide_block_phases_spec} />
    </Provider>,
    document.querySelector('#app')
  );
});
