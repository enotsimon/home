import uuidv1 from 'uuid/v1';

import Util from "common/util";
import game from '../monster'
import * as actions from '../actions'
import * as container_funcs from './containers'

//
// the very buisness logic
//
export function item_create(type, id_container) {
  let id_item = type + '-' + uuidv1();
  game.store.dispatch(actions.item_create(id_item, type, id_container));
  container_funcs.dispatch_add_item(id_container, id_item);
}

export function item_delete(id_item) {
  let items = game.store.getState().items;
  if (!items[id_item]) {
    // throw?
    return false;
  }
  // use backlink!?
  container_funcs.dispatch_remove_item(items[id_item].id_container, id_item);
  game.store.dispatch(actions.item_delete(id_item));
}

export function item_change_container(id_item, id_container) {
  let state = game.store.getState();
  if (!state.items[id_item]) {
    throw({msg: 'cannot change item container cause item is not exist', id_item});
  }
  let id_prev_container = state.items[id_item].id_container;
  if (!state.containers[id_prev_container]) {
    throw({msg: 'cannot change item container cause prev container is not exist', id_prev_container});
  }
  if (!state.containers[id_container]) {
    throw({msg: 'cannot change item container cause new container is not exist', id_container});
  }
  if (state.containers[id_prev_container].items.indexOf(id_item) === -1) {
    throw({msg: 'cannot change item container cause item is not in prev container', id_item, id_prev_container});
  }
  container_funcs.dispatch_remove_item(id_prev_container, id_item);
  container_funcs.dispatch_add_item(id_container, id_item);
  game.store.dispatch(actions.item_change_container(id_item, id_container));
}

//
// reducers
//
export function reduce_item_create(state, id_item, type, id_container) {
  let item = new Item(id_item, type, id_container);
  let new_state = {...state};
  new_state[id_item] = item;
  return new_state;
}

export function reduce_item_delete(state, id_item) {
  let new_state = {...state};
  delete(new_state[id_item]);
  return new_state;
}

export function reduce_item_change_container(state, id_item, id_container) {
  let new_state = {...state};
  let new_item = {...new_state[id_item], id_container};
  new_state[id_item] = new_item;
  return new_state;
}

//
// data obj
//
export class Item {
  constructor(id, type, id_container) {
    this.id = id;
    this.type = type;
    this.id_container = id_container; // backlink?
  }
}
