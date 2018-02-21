import uuidv1 from 'uuid/v1';

import Util from "common/util";
import game from '../monster'
import * as actions from '../actions'
import {INVENTORY, container_dispatch_add_item, container_dispatch_remove_item} from './containers'
import {show_notification} from 'monster/lib/notification'

//
// the very buisness logic
//
export function item_create(type, id_container, owner) {
  let id_item = type + '-' + uuidv1();
  game.store.dispatch(actions.item_create(id_item, type, id_container, owner));
  container_dispatch_add_item(id_container, id_item);
}

export function item_delete(id_item) {
  let items = game.store.getState().items;
  if (!items[id_item]) {
    // throw?
    return false;
  }
  // use backlink!?
  container_dispatch_remove_item(items[id_item].id_container, id_item);
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
  // check for item owner/ should it be here?
  if (state.items[id_item].owner) {
    show_notification('warning', game.config.text.menues.inspect_furniture.cant_take_owned_item)
    return false
  }
  container_dispatch_remove_item(id_prev_container, id_item);
  container_dispatch_add_item(id_container, id_item);
  game.store.dispatch(actions.item_change_container(id_item, id_container));
}

export function put_item_to_inventory(id_item) {
  item_change_container(id_item, INVENTORY);
}

//
// reducers
//
export function reduce_item_create(state, id_item, type, id_container, owner) {
  let item = new Item(id_item, type, id_container, owner);
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
  constructor(id, type, id_container, owner) {
    this.id = id;
    this.type = type;
    this.id_container = id_container; // backlink?
    this.owner = owner
  }
}
