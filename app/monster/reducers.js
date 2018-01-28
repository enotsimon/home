import { combineReducers } from 'redux';
import * as actions from './actions';

import * as container_util from './container_util';
import * as item_util from './item_util';

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

  // UI react parts
  menues: {
    main_menu: {
      elements: [],
      current_element: null,
    },
    dialogs: {
      id_mobile: null,
      player_prev_sentence: null,
      npc_sentence: null,
      player_sentences: [],
    },
    inspect_furniture: {
      id_furniture: null,
      id_item: null,
    },
  },
  user_notification: {
    message: '',
    level: 'info',
    additional: null,
  },
};

function game_phase(state = defaults.game_phase, action) {
  switch (action.type) {
    case actions.CHANGE_SCENE:
      return 'idle';
    case actions.DIALOG_START:
      return 'dialog';
    case actions.DIALOG_FINISH:
      return 'idle';
    case actions.INSPECT_BEGIN:
      return 'inspect';
    case actions.INSPECT_END: // ???
      return 'idle';
    default:
      return state;
  }
}

function flags(state = defaults.flags, action) {
  switch (action.type) {
    case actions.CHANGE_GLOBAL_FLAG:
      let new_state = {...state};
      new_state[action.name] = action.value;
      return new_state;
    default:
      return state;
  }
}

function containers(state = defaults.containers, action) {
  switch (action.type) {
    case actions.CONTAINER_INIT:
      return container_util.reduce_init_container(state, action.id_container);
    case actions.CONTAINER_ADD_ITEM:
      return container_util.reduce_add_item(state, action.id_container, action.id_item);
    case actions.CONTAINER_REMOVE_ITEM:
      return container_util.reduce_remove_item(state, action.id_container, action.id_item);
    default:
      return state;
  }
}

function items(state = defaults.items, action) {
  switch (action.type) {
    case actions.ITEM_CREATE:
      return item_util.reduce_item_create(state, action.id_item, action.item_type, action.id_container);
    case actions.ITEM_DELETE:
      return item_util.reduce_item_delete(state, action.id_item);
    case actions.ITEM_CHANGE_CONTAINER:
      return item_util.reduce_item_change_container(state, action.id_item, action.id_container);
    default:
      return state;
  }
}

function current_scene_name(state = defaults.current_scene_name, action) {
  switch (action.type) {
    case actions.CHANGE_SCENE:
      return action.scene_name;
    default:
      return state;
  }
}

function inspect_furniture(state = defaults.menues.inspect_furniture, action) {
  switch (action.type) {
    case actions.INSPECT_BEGIN:
      return {...state, id_furniture: action.id_furniture, id_item: null};
    case actions.INSPECT_END: // ???
      return {...state, id_furniture: null, id_item: null};
    case actions.INSPECT_FURNITURE_ITEM_CLICK:
      return {...state, id_item: action.id_item}
    default:
      return state;
  }
}

function money(state = defaults.money, action) {
  switch (action.type) {
    case actions.CHANGE_MONEY_AMOUNT:
      console.log('action', actions.CHANGE_MONEY_AMOUNT, action, state);
      if (action.money_type != 'fishes' && action.money_type != 'foxes') {
        throw({message: "bad money type", value: action.money_type});
      }
      let new_state = {...state};
      // @TODO add negative values chack
      new_state[action.money_type] += action.amount;
      return new_state;
    default:
      return state;
  }
}


/**
 *  @TODO what about nested actions -- like
 *  take off current clothes
 *  put it in inventory
 *  get given clothes from inventory
 *  put it on
 */
function clothes(state = defaults.clothes, action) {
  switch (action.type) {
    case actions.DRESS_CLOTHES:
      console.log('action', actions.DRESS_CLOTHES, action, state);
      // TOSO -- its just a draft
      if (!action.item.body_layer) {
        console.log('actions.DRESS_CLOTHES fail -- not a clothes', action.item);
        return state;
      }
      let new_state = {...state, body: action.item};
      
      return new_state;
    default:
      return state;
  }
}


/////////////////////////////////////////
// UI
/////////////////////////////////////////

function main_menu(state = defaults.menues.main_menu, action) {
  let state_copy;
  switch (action.type) {
    case actions.REBUILD_MAIN_MENU:
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
    case actions.MAIN_MENU_CLICK:
      state_copy = {
        ...state,
        current_element: action.id
      }
      return state_copy;
    // really nothing interesting, just unset current_element
    case actions.MAIN_MENU_SUBELEMENT_CLICK:
      state_copy = {
        ...state,
        current_element: null
      }
      return state_copy;
    default:
      return state;
  }
}

function dialogs(state = defaults.menues.dialogs, action) {
  let new_state = {...state};
  switch (action.type) {
    case actions.DIALOG_START:
      new_state.id_mobile = action.id_mobile;
      return new_state;
    case actions.DIALOG_FINISH:
      // flush dialogs state
      return defaults.menues.dialogs;
    case actions.DIALOG_ACTIVATE_NPC_SENTENCE:
      new_state.npc_sentence = action.sentence;
      new_state.player_sentences = []; // flush player's answers
      return new_state;
    case actions.DIALOG_ACTIVATE_PLAYER_SENTENCES:
      new_state.player_sentences = action.sentences;
      return new_state;
    // TODO add player_prev_sentence
    default:
      return state;
  }
}

function user_notification(state = defaults.user_notification, action) {
  switch (action.type) {
    case actions.SHOW_NOTIFICATION:
      console.log('action', action.type, action, state);
      return {level: action.level, message: action.message, additional: action.additional};
    default:
      return state;
  }
}



const root_reducer = combineReducers({
  menues: combineReducers({
    main_menu,
    dialogs,
    inspect_furniture,
  }),
  game_phase,
  current_scene_name,
  containers,
  items,
  flags,
  money,
  clothes,
  user_notification,
});

export default root_reducer;
