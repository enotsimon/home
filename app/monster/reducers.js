import { combineReducers } from 'redux';
import * as actions from './actions';

import {container_reduce_init, container_reduce_add_item, container_reduce_remove_item} from './lib/containers'
import {reduce_item_create, reduce_item_delete, reduce_item_change_container} from './lib/items'
import {journal_add_entry, journal_msg_levels} from 'monster/lib/journal'

let defaults = {
  game_phase: 'idle', // idle, dialog, inspect | alchemy, travel_map, interaction (with container), inventory?
  current_scene_name: null,
  money: {
    fishes: 0,
    foxes: 0,
  },
  clothes: {
    body: "dirty_dress",
  },
  inventory: [],
  flags: {},
  containers: {},
  items: {},
  journal: {
    enabled_levels: [journal_msg_levels.GAME],
    data: [],
  },

  // UI react parts
  menues: {
    main_menu: {
      elements: [],
      current_element: null,
    },
    dialogs: {
      id_mobile: null, // TODO remove it!!! pass it explisitly every time!
      player_prev_sentence: null,
      npc_sentence: null,
      player_sentences: [],
    },
    inspect_furniture: {
      id_furniture: null,
      id_item: null,
      inventory_id_item: null,
    },
  },
};

const game_phase = {
  [actions.CHANGE_SCENE]: (state, action) => 'idle',
  [actions.DIALOG_START]: (state, action) => 'dialog',
  [actions.DIALOG_FINISH]: (state, action) => 'idle',
  [actions.INSPECT_BEGIN]: (state, action) => 'inspect',
  [actions.INSPECT_END]: (state, action) => 'idle',
}

const flags = {
  [actions.CHANGE_GLOBAL_FLAG]: (state, action) => {
    return {...state, [action.name]: action.value};
  },
}

const containers = {
  [actions.CONTAINER_INIT]: (state, action) =>
    container_reduce_init(state, action.id_container),
  [actions.CONTAINER_ADD_ITEM]: (state, action) =>
    container_reduce_add_item(state, action.id_container, action.id_item),
  [actions.CONTAINER_REMOVE_ITEM]: (state, action) =>
    container_reduce_remove_item(state, action.id_container, action.id_item),
}

const items = {
  [actions.ITEM_CREATE]: (state, action) =>
    reduce_item_create(state, action.id_item, action.item_type, action.id_container),
  [actions.ITEM_DELETE]: (state, action) =>
    reduce_item_delete(state, action.id_item),
  [actions.ITEM_CHANGE_CONTAINER]: (state, action) =>
    reduce_item_change_container(state, action.id_item, action.id_container),
}

const current_scene_name = {
  [actions.CHANGE_SCENE]: (state, action) => action.scene_name,
}

const journal = {
  // note that we do not add this action to journal
  [actions.journal_filter_click.name]: (state, action) => {
    let i = state.enabled_levels.indexOf(action.level)
    if (state.enabled_levels.length === 1 && i !== -1) {
      return state
    }
    let enabled_levels = [...state.enabled_levels]
    i !== -1 ? enabled_levels.splice(i, 1) : enabled_levels.push(action.level)
    return {...state, enabled_levels}
  },
  default: journal_add_entry
}

const money = {
  [actions.CHANGE_MONEY_AMOUNT]: (state, action) => {
    console.log('action', actions.CHANGE_MONEY_AMOUNT, action, state);
    if (action.money_type != 'fishes' && action.money_type != 'foxes') {
      throw({message: "bad money type", value: action.money_type});
    }
    let new_state = {...state};
    // @TODO add negative values chack
    new_state[action.money_type] += action.amount;
    return new_state;
  },
}


/**
 *  @TODO what about nested actions -- like
 *  take off current clothes
 *  put it in inventory
 *  get given clothes from inventory
 *  put it on
 */
const clothes = {
  [actions.DRESS_CLOTHES]: (state, action) => {
    console.log('action', actions.DRESS_CLOTHES, action, state);
    // TOSO -- its just a draft
    if (!action.item.body_layer) {
      console.log('actions.DRESS_CLOTHES fail -- not a clothes', action.item);
      return state;
    }
    let new_state = {...state, body: action.item};
    
    return new_state;
  }
}


/////////////////////////////////////////
// UI
/////////////////////////////////////////
const inspect_furniture = {
  [actions.INSPECT_BEGIN]: (state, action) =>
    ({...state, id_furniture: action.id_furniture, id_item: null, inventory_id_item: null}),
  // ???
  [actions.INSPECT_END]: (state, action) =>
    ({...state, id_furniture: null, id_item: null, inventory_id_item: null}),
  [actions.INSPECT_FURNITURE_ITEM_CLICK]: (state, action) =>
    ({...state, id_item: action.id_item, inventory_id_item: null}),
  [actions.INSPECT_FURNITURE_INVENTORY_ITEM_CLICK]: (state, action) =>
    ({...state, id_item: null, inventory_id_item: action.id_item}),
}

const main_menu = {
  [actions.REBUILD_MAIN_MENU]: (state, action) => {
    let prepare_items = (links, type) => links.map(e => ({id: e, type: type}));
    let menu = {
      elements: [
        {id: 'go_to', items: prepare_items(action.current_scene.links, 'scenes')},
        {id: 'speak_to', items: prepare_items(action.current_scene.mobiles, 'mobiles')},
        {id: 'inspect', items: prepare_items(action.current_scene.furniture, 'furniture')},
      ],
      current_element: null,
    };
    return menu;
  },
  [actions.MAIN_MENU_CLICK]: (state, action) => {
    return {...state, current_element: action.id}
  },
  // really nothing interesting, just unset current_element
  [actions.MAIN_MENU_SUBELEMENT_CLICK]: (state, action) => {
    return {...state, current_element: null}
  },
}

const dialogs = {
  [actions.DIALOG_START]: (state, action) => {
    return {...state, id_mobile: action.id_mobile} // TODO remove id_mobile
  },
  [actions.DIALOG_FINISH]: (state, action) => {
    return defaults.menues.dialogs
  },
  [actions.DIALOG_NPC_SAYS]: (state, action) => {
    return {...state, id_mobile: action.id_mobile, npc_sentence: action.sentence, player_sentences: []}
  },
  [actions.DIALOG_PLAYER_SAYS]: (state, action) => {
    return {...state, player_prev_sentence: action.sentence}
  },
  [actions.DIALOG_ACTIVATE_PLAYER_SENTENCES]: (state, action) => {
    return {...state, player_sentences: action.sentences}
  }
}

function create_reducer(default_state, handlers) {
  return (state = default_state, action) => {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else if (handlers.hasOwnProperty('default')) {
      return handlers.default(state, action)
    } else {
      return state
    }
  }
}

const root_reducer = combineReducers({
  menues: combineReducers({
    main_menu: create_reducer(defaults.menues.main_menu, main_menu),
    dialogs: create_reducer(defaults.menues.dialogs, dialogs),
    inspect_furniture: create_reducer(defaults.menues.inspect_furniture, inspect_furniture),
  }),
  game_phase: create_reducer(defaults.game_phase, game_phase),
  current_scene_name: create_reducer(defaults.current_scene_name, current_scene_name),
  containers: create_reducer(defaults.containers, containers),
  items: create_reducer(defaults.items, items),
  flags: create_reducer(defaults.flags, flags),
  journal: create_reducer(defaults.journal, journal),
  money: create_reducer(defaults.money, money),
  clothes: create_reducer(defaults.clothes, clothes),
});

export default root_reducer;
