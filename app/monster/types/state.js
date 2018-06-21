// @flow
import type {id_scene} from "./scene_types"
import type {id_item} from "./item_types"
import type {action_dialog_phrase} from "./dialog_types"
import type {id_container} from "./container_types"
import type {flag_name, flag_value} from './flag'


export type state_game_phase = 'idle' | 'dialog' | 'inspect' // alchemy, travel_map, interaction (with container), inventory?

export type state_flags = {[key: flag_name]: flag_value}

// TODO move it from here
export type money = {
  fishes: number,
  foxes: number,
}

// TODO move it from here
export type clothes = {
  body: id_item,
}

export type main_menu_element = {
  id: main_menu_element_id,
  items: Array<main_menu_element_item>
}

export type main_menu_element_id = 'go_to' | 'speak_to' | 'inspect'

export type main_menu_element_item = {
  text_data: any, // FIXME
  text_type: 'scenes' | 'mobiles' | 'furniture',
  action_data: any, // FIXME
}

export type state = {
  game_phase: state_game_phase,
  current_scene_name: ?id_scene,
  money: money,
  clothes: clothes,
  inventory: [],
  flags: state_flags,
  containers: {},
  items: {},
  journal: {
    enabled_levels: Array<string>, // TODO add normal types
    data: Array<string>, // TODO
  },

  // UI react parts
  menues: {
    main_menu: {
      elements: Array<main_menu_element>,
      current_element: ?main_menu_element_id,
    },
    dialogs: {
      player_sentences: Array<action_dialog_phrase>,
      phrases: Array<action_dialog_phrase>,
    },
    inspect_furniture: {
      id_furniture: ?id_container,
      id_item: ?id_item,
      inventory_id_item: ?id_item, // ???
    },
  },
  notification: {
    level: any, // TODO
    msg: any, // TODO
  }
}

export type reducer_map_callback = (state: any, action: any) => any

export type reducer_map = {
  [key: string]: reducer_map_callback, // FIXME state: any
  default?: reducer_map_callback,
}
