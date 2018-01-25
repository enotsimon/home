import Util from "common/util";
import game from './monster';
import * as actions from './actions';

export function dispatch_init(id) {
  let containers = game.store.getState().containers;
  if (containers.id) {
    // throw?
    throw({msg: 'cannot init container, given id already exists', id});
  }
  game.store.dispatch(actions.container_init(id));
}

// item or id_item???
export function dispatch_add_item(id_container, id_item) {
  let containers = game.store.getState().containers;
  let container = containers[id_container];
  if (!container) {
    // throw?
    throw({msg: 'no container found by id', id_container});
  }
  // TODO add item checks
  if (container.items.indexOf(id_item) !== -1) {
    // throw?
    //throw({msg: 'cannot add item cause its already there', id_container, item});
    return false;
  }
  game.store.dispatch(actions.container_add_item(id_container, id_item));
}

// item or id_item???
export function dispatch_remove_item(id_container, id_item) {
  let containers = game.store.getState().containers;
  let container = containers[id_container];
  if (!container) {
    // throw?
    throw({msg: 'no container found by id', id_container});
  }
  // TODO add item checks
  if (container.items.indexOf(id_item) === -1) {
    // throw?
    //throw({msg: 'cannot add item cause its already there', id_container, item});
    return false;
  }
  game.store.dispatch(actions.container_remove_item(id_container, id_item));
}

//
// those funcs are reducers! so clone objects!
//
export function reduce_init_container(state, id_container) {
  let new_state = {...state};
  new_state[id_container] = new Container(id_container)
  return new_state;
}

export function reduce_add_item(state, id_container, id_item) {
  let new_state = {...state};
  let container = {...new_state[id_container]};
  container.items.push(id_item);
  new_state[container.id] = container;
  return new_state;
}

export function reduce_remove_item(state, id_container, id_item) {
  let new_state = {...state};
  let container = {...new_state[id_container]};
  Util.remove_element(id_item, container.items);
  new_state[container.id] = container;
  return new_state;
}

//
// data obj
//
export class Container {
  constructor(id) {
    this.id = id;
    this.items = [];
  }
}
