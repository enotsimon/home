
import ReactDOM from 'react-dom';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux'

import root_reducer from './reducers';
import * as actions from './actions';

import Util from "common/util";
import App from 'monster/components/app';

import dialogs from 'monster/config/dialogs'; // TEMP
import {INVENTORY, container_dispatch_init} from './lib/containers'
import {item_create} from './lib/items'
import {parse_yaml_config} from './yaml_parser_test'
import {contentLoaded} from 'document-promises'

const check_config_cosistency = () => {
  // TODO
}

const create_containers_and_items = (config) => {
  // TODO add special containers -- alchemy menu container, ?
  container_dispatch_init(INVENTORY)
  // TEMP DEBUG
  item_create('humble_dress', INVENTORY, null)
  item_create('dried_fish', INVENTORY, null)

  for (let id_furniture in config.furniture) {
    let furniture_item = config.furniture[id_furniture];
    let id_container = id_furniture;
    container_dispatch_init(id_container);
    
    for (let id_item in furniture_item.items) {
      let item_config = furniture_item.items[id_item];
      item_create(item_config.type, id_container, item_config.owner);
    }
  }
}

const game = {
  config: null,
  store: createStore(root_reducer)
}
export default game


// i hate this code
const init_react = () => {
  let show_hide_block_phases_spec = {
    show_scene_phases: ["idle", "dialog", "inspect"],
    show_dialog_phases: ["dialog"],
    show_main_menu_phases: ["idle", "inspect"],
    show_furniture_phases: ["inspect"],
  }

  ReactDOM.render(
    <Provider store={game.store}>
      <App {...show_hide_block_phases_spec} />
    </Provider>,
    document.querySelector('#app')
  )
}

// WARNING! this crap changes input args!
const init_game = (game, config) => {
  check_config_cosistency(config)
  game.config = config // !!!
  create_containers_and_items(game.config)
  actions.bound_change_scene('mage_room')
}

let config_path = '/monster/config'
let game_inited = fetch(config_path + '/config.yml')
  .then(response => {
    if (response.ok) {
      return response.text()
    }
    throw {msg: 'cant get config', response}
  })
  .then(text => {
    let yaml_config = parse_yaml_config(text)
    console.log('yaml_config', yaml_config)
    
    // TEMP merge old dialogs
    let config = {...yaml_config, 
      dialogs,
      text: require('./text/rus.js').default,
    }

    init_game(game, config)
  })
Promise.all([game_inited, contentLoaded]).then(init_react)

//require('./alchemy_test')
