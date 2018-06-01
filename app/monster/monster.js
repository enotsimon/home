
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
import {parse_dialogs, parse_raw} from './yaml_parser_test'
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
  config: {},
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
const init_game = () => {
  check_config_cosistency(game.config)
  create_containers_and_items(game.config)
  actions.bound_change_scene('mage_room')
}

let config = {}
const load_config_entry = (config_file_name, parse_func, prop_name) => {
  let config_path = '/monster/config' // TEMP

  return fetch(config_path + '/' + config_file_name + '.yml')
  .then(response => {
    if (response.ok) {
      return response.text()
    }
    throw {msg: 'cant get config', config_file_name, response}
  })
  .then(text => {
    let parsed_config = parse_func(text)
    console.log('parsed config', config_file_name, parsed_config)
    game.config[prop_name] = parsed_config
  })
}

Promise.all([
  load_config_entry('dialogs', parse_dialogs, 'dialogs'),
  load_config_entry('scenes', parse_raw, 'scenes'),
  load_config_entry('mobiles', parse_raw, 'mobiles'),
  load_config_entry('furniture', parse_raw, 'furniture'),
  contentLoaded
]).then(() => {
  game.config.text = require('./text/rus.js').default
  // TEMP until yaml dialogs config is on the way
  game.config.dialogs = dialogs
  console.log('config IS', game.config)
  init_game()
  init_react()
})

//require('./alchemy_test')
