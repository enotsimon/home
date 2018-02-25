
import ReactDOM from 'react-dom';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux'

import root_reducer from './reducers';
import * as actions from './actions';

import Util from "common/util";
import App from 'monster/components/app';

import mobiles from 'monster/config/mobiles';
import scenes from 'monster/config/scenes';
import dialogs from 'monster/config/dialogs';
import furniture from 'monster/config/furniture';
import {INVENTORY, container_dispatch_init} from './lib/containers'
import {item_create} from './lib/items'

class Game {
  init_game() {
    this.config = {
      mobiles,
      scenes,
      dialogs,
      furniture,
      text: require('./text/rus.js').default,
    };
    
    this.store = createStore(root_reducer);

    this.check_config_cosistency();
    this.create_containers_and_items();

    actions.bound_change_scene('mage_room');
  }

  check_config_cosistency() {
    // TODO
  }

  create_containers_and_items() {
    // TODO add special containers -- alchemy menu container, ?
    container_dispatch_init(INVENTORY)
    // TEMP DEBUG
    item_create('humble_dress', INVENTORY, null)
    item_create('dried_fish', INVENTORY, null)

    for (let id_furniture in this.config.furniture) {
      let furniture_item = this.config.furniture[id_furniture];
      let id_container = id_furniture;
      container_dispatch_init(id_container);
      
      for (let id_item in furniture_item.items) {
        let item_config = furniture_item.items[id_item];
        item_create(item_config.type, id_container, item_config.owner);
      }
    }
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
