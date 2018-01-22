
import game from './monster';
import * as dialog_util from './dialog_util';

export const CHANGE_SCENE = 'change_scene';
export const REBUILD_MAIN_MENU = 'rebuild_main_menu';
export const CHANGE_MONEY_AMOUNT = 'change_money_amount';
export const DRESS_CLOTHES = 'dress_clothes';
export const INVENTORY_ADD_ITEM = 'inventory_add_item';
export const INVENTORY_REMOVE_ITEM = 'inventory_remove_item';
export const CHANGE_GLOBAL_FLAG = 'change_global_flag';
export const DIALOG_START = 'dialog_start';
export const DIALOG_FINISH = 'dialog_finish';
export const DIALOG_ACTIVATE_NPC_SENTENCE = 'dialog_activate_npc_sentence';
export const DIALOG_ACTIVATE_PLAYER_SENTENCES = 'dialog_activate_player_sentences';
export const INSPECT_BEGIN = 'inspect_begin';
export const INSPECT_END = 'inspect_end';
export const CONTAINER_INIT = 'container_init';
export const CONTAINER_ADD_ITEM = 'container_add_item';
export const CONTAINER_REMOVE_ITEM = 'container_remove_item';
export const ITEM_CREATE = 'item_create';
export const ITEM_DELETE = 'item_delete';
export const ITEM_CHANGE_CONTAINER = 'item_change_container';

export const ERROR_CHANGE_SCENE_UNKNOWN_SCENE = 'error_change_scene_unknown_scene';
export const ERROR_CHANGE_SCENE_NOT_LINKED_SCENE = 'error_change_scene_not_linked_scene';
export const SHOW_NOTIFICATION = 'show_notification';


////////////////////////
// error messages
////////////////////////
export function error_change_scene_unknown_scene(scene_name) {
  return show_notification('error', ERROR_CHANGE_SCENE_UNKNOWN_SCENE, {target_scene: scene_name});
}

export function error_change_scene_not_linked_scene(scene_name) {
  return show_notification('error', ERROR_CHANGE_SCENE_NOT_LINKED_SCENE, {target_scene: scene_name});
}

export function show_notification(level, message, additional) {
  return {type: SHOW_NOTIFICATION, level, message, additional};
}

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
export function dialog_start(id_mobile) {
  return {type: DIALOG_START, id_mobile};
}

export function dialog_finish() {
  return {type: DIALOG_FINISH};
}

export function dialog_activate_npc_sentence(sentence) {
  return {type: DIALOG_ACTIVATE_NPC_SENTENCE, sentence};
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

export function container_add_item(id_container, id_item) {
  return {type: CONTAINER_ADD_ITEM, id_container, id_item};
}

export function container_remove_item(id_container, id_item) {
  return {type: CONTAINER_REMOVE_ITEM, id_container, id_item};
}

// items //////////////////////////////
export function item_create(id_item, item_type, id_container) {
  return {type: ITEM_CREATE, id_item, item_type, id_container};
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
export function bound_change_scene(scene_name) {
  let target_scene = game.config.scenes[scene_name];
  let current_scene = game.config.scenes[game.store.getState().current_scene_name];
  if (!target_scene) {
    game.store.dispatch(error_change_scene_unknown_scene(scene_name));
    return false;
  }
  // current_scene can be null -- on game init
  if (current_scene && current_scene.links.indexOf(target_scene.name) == -1) {
    game.store.dispatch(error_change_scene_not_linked_scene(scene_name));
    return false;
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

export function main_menu_click(id) {
  return {type: MAIN_MENU_CLICK, id};
}

export function main_menu_subelement_click(id) {
  return {type: MAIN_MENU_SUBELEMENT_CLICK, id};
}

/////////////////////////////////
// UI bound action creators
/////////////////////////////////
export function bound_main_menu_action(id_subelement) {
  let current_element = game.store.getState().menues.main_menu.current_element;
  game.store.dispatch(main_menu_subelement_click(id_subelement));
  switch (current_element) {
    case 'go_to':
      return bound_change_scene(id_subelement);
    case 'speak_to':
      return dialog_util.start_dialog(id_subelement);
    case 'inspect':
      game.store.dispatch(inspect_begin(id_subelement));
    default:
      return null;
  }
}

