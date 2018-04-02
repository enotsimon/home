
import game from './monster';
import {get_scene_available_links} from 'monster/lib/scenes'

export const CHANGE_SCENE = 'change_scene';
export const REBUILD_MAIN_MENU = 'rebuild_main_menu';
export const CHANGE_MONEY_AMOUNT = 'change_money_amount';
export const DRESS_CLOTHES = 'dress_clothes';
export const INVENTORY_ADD_ITEM = 'inventory_add_item';
export const INVENTORY_REMOVE_ITEM = 'inventory_remove_item';
export const CHANGE_GLOBAL_FLAG = 'change_global_flag';
export const DIALOG_START = 'dialog_start';
export const DIALOG_FINISH = 'dialog_finish';
export const DIALOG_NPC_SAYS = 'dialog_npc_says';
export const DIALOG_PLAYER_SAYS = 'dialog_player_says';
export const DIALOG_ACTIVATE_PLAYER_SENTENCES = 'dialog_activate_player_sentences';
export const INSPECT_BEGIN = 'inspect_begin';
export const INSPECT_END = 'inspect_end';
export const CONTAINER_INIT = 'container_init';
export const ITEM_CREATE = 'item_create';
export const ITEM_DELETE = 'item_delete';
export const ITEM_CHANGE_CONTAINER = 'item_change_container';

/////////////////////////
// main
/////////////////////////
export function change_scene(scene_name) {
  return {type: CHANGE_SCENE, scene_name};
}

// current_scene -- scene object from config
export function rebuild_main_menu(current_scene) {
  return {type: REBUILD_MAIN_MENU, current_scene};
}


export function change_money_amount(money_type, amount) {
  return {type: CHANGE_MONEY_AMOUNT, money_type, amount};
}

// explisitly set layer?
export function dress_clothes(item) {
  return {type: DRESS_CLOTHES, item};
}

export function inventory_add_item(item) {
  return {type: INVENTORY_ADD_ITEM, item};
}

export function inventory_remove_item(item) {
  return {type: INVENTORY_REMOVE_ITEM, item};
}

export function change_global_flag(name, value) {
  return {type: CHANGE_GLOBAL_FLAG, name, value};
}

// dialogs //////////////////////
// what if we start multi-person dialog? should pass array of mobiles?
export function dialog_start(id_node) {
  return {type: DIALOG_START, id_node};
}

export function dialog_finish() {
  return {type: DIALOG_FINISH};
}

export function dialog_npc_says(sentence, id_mobile) {
  return {type: DIALOG_NPC_SAYS, sentence, id_mobile};
}

export function dialog_player_says(sentence) {
  return {type: DIALOG_PLAYER_SAYS, sentence};
}

export function dialog_activate_player_sentences(sentences) {
  return {type: DIALOG_ACTIVATE_PLAYER_SENTENCES, sentences};
}

//////////////////////////////////////////
export function inspect_begin(id_furniture) {
  return {type: INSPECT_BEGIN, id_furniture};
}

export function inspect_end() {
  return {type: INSPECT_END};
}

// containers /////////////////////////
export function container_init(id_container) {
  return {type: CONTAINER_INIT, id_container};
}

// items //////////////////////////////
export function item_create(id_item, item_type, id_container, owner) {
  return {type: ITEM_CREATE, id_item, item_type, id_container, owner};
}

export function item_delete(id_item) {
  return {type: ITEM_DELETE, id_item};
}

export function item_change_container(id_item, id_container) {
  return {type: ITEM_CHANGE_CONTAINER, id_item, id_container};
}
///////////////////////////////////////

/////////////////////////////////
// bound action creators
/////////////////////////////////
// TODO move code to 'lib/scenes'
export function bound_change_scene(scene_name) {
  let target_scene = game.config.scenes[scene_name];
  let current_scene = game.config.scenes[game.store.getState().current_scene_name];
  if (!target_scene) {
    throw({msg: 'unknown scene', scene_name})
    return false;
  }
  // current_scene can be null -- on game init
  if (current_scene) {
    let links = get_scene_available_links(current_scene)
    if (links.indexOf(target_scene.name) == -1) {
      throw({msg: 'not linked scene', scene_name, current_scene})
    }
  }

  game.store.dispatch(inspect_end()); // ???
  game.store.dispatch(change_scene(scene_name));
  // it has changed! dont forget it!
  current_scene = game.config.scenes[game.store.getState().current_scene_name];
  game.store.dispatch(rebuild_main_menu(current_scene));
}



/////////////////////////////////////////
// UI
/////////////////////////////////////////
export const MAIN_MENU_CLICK = 'main_menu_click';
export const MAIN_MENU_SUBELEMENT_CLICK = 'main_menu_subelement_click';
export const INSPECT_FURNITURE_ITEM_CLICK = 'inspect_furniture_item_click';
export const INSPECT_FURNITURE_INVENTORY_ITEM_CLICK = 'inspect_furniture_inventory_item_click';

export function main_menu_click(id) {
  return {type: MAIN_MENU_CLICK, id};
}

export function main_menu_subelement_click(id) {
  return {type: MAIN_MENU_SUBELEMENT_CLICK, id};
}

export function inspect_furniture_item_click(id_item) {
  return {type: INSPECT_FURNITURE_ITEM_CLICK, id_item};
}

export function inspect_furniture_inventory_item_click(id_item) {
  return {type: INSPECT_FURNITURE_INVENTORY_ITEM_CLICK, id_item};
}

export const journal_filter_click = (level) => {
  return {type: 'journal_filter_click', level};
}

export const notification_msg = (level, msg) => ({type: 'notification_msg', level, msg})
export const notification_close = () => ({type: 'notification_close'})
