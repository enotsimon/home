// @flow
import ReactDOM from 'react-dom';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux'

import root_reducer from './reducers';
import * as actions from './actions';

import Util from "./../common/util";
import App from './components/app'

//import dialogs from 'monster/config/dialogs'; // TEMP
import {INVENTORY, container_dispatch_init} from './lib/containers'
import {item_create} from './lib/items'
import {parse_dialogs, parse_raw} from './config_parser'
import {contentLoaded} from 'document-promises'

import type {Store} from 'redux'

import type {dialogs_config} from './types/dialog_types'
import type {containers_config} from './types/container_types'
import type {scenes_config} from './types/scene_types'
import type {mobiles_config} from './types/mobile_types'

const check_config_cosistency = (config: GameConfig): void => {
  // TODO ??? maybe config parser should do it all?
}

const create_containers_and_items = (config: GameConfig): void => {
  // TODO add special containers -- alchemy menu container, ?
  container_dispatch_init(INVENTORY)
  // TEMP DEBUG
  item_create('humble_dress', INVENTORY, null)
  item_create('dried_fish', INVENTORY, null)

  for (let id_container in config.furniture) {
    let furniture_item = config.furniture[id_container]
    container_dispatch_init(id_container)
    
    furniture_item.items.forEach(item => item_create(item.type, id_container, item.owner))
  }
}
type GameConfig = {
  dialogs: dialogs_config,
  scenes: scenes_config,
  mobiles: mobiles_config,
  furniture: containers_config,
  text: Object,
}
type GameData = {
  config: GameConfig,
  store: Store<any>,
}

const game: GameData = {
  config: {
    dialogs: {},
    scenes: {},
    mobiles: {},
    furniture: {},
    text: {}
  },
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

  let dom_container = document.querySelector('#app')
  if (dom_container) {
    ReactDOM.render(
      <Provider store={game.store}>
        <App {...show_hide_block_phases_spec} />
      </Provider>,
      dom_container
    )
  } else {
    throw({msg: "no document element by id 'app' found"})
  }
}

// WARNING! this crap changes input args!
const init_game = () => {
  check_config_cosistency(game.config)
  create_containers_and_items(game.config)
  actions.bound_change_scene('mage_room')
}

let config = {}
function load_config_entry<T>(config_file_name: string, parse_func: (string => T)): Promise<T> {
  let config_path = '/monster/config' // TEMP

  return fetch(config_path + '/' + config_file_name + '.yml')
  .then(response => {
    if (response.ok) {
      return response.text()
    }
    throw {msg: 'cant get config', config_file_name, response}
  })
  .then(parse_func)
}

Promise.all([
  load_config_entry('dialogs', parse_dialogs),
  load_config_entry('scenes', parse_raw),
  load_config_entry('mobiles', parse_raw),
  load_config_entry('furniture', parse_raw),
  contentLoaded
]).then(([dialogs, scenes, mobiles, furniture]) => {
  // TEMP use dialogs imported from js until yaml dialogs config is on the way
  game.config = {dialogs, scenes, mobiles, furniture, text: require('./text/rus.js').default}
  init_game()
  init_react()
})

//require('./alchemy_test')
