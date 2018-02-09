import * as actions from 'monster/actions';

export const journal_msg_levels = {
  GAME: 'game',
  ADMIN: 'admin',
  DEBUG: 'debug',
  UNKNOWN: 'unknown',
}

const msg_level_colors = {
  [journal_msg_levels.GAME]: 'green',
  [journal_msg_levels.ADMIN]: 'darkblue',
  [journal_msg_levels.DEBUG]: 'darkgrey',
  [journal_msg_levels.UNKNOWN]: 'darkred',
}

const action_to_level = {
  [actions.CHANGE_SCENE]: journal_msg_levels.GAME,
  [actions.REBUILD_MAIN_MENU]: journal_msg_levels.DEBUG,
  [actions.CHANGE_MONEY_AMOUNT]: journal_msg_levels.GAME,
  [actions.DRESS_CLOTHES]: journal_msg_levels.GAME,
  [actions.INVENTORY_ADD_ITEM]: journal_msg_levels.GAME, // ?
  [actions.INVENTORY_REMOVE_ITEM]: journal_msg_levels.GAME,
  [actions.CHANGE_GLOBAL_FLAG]: journal_msg_levels.ADMIN,
  [actions.DIALOG_START]: journal_msg_levels.GAME,
  [actions.DIALOG_FINISH]: journal_msg_levels.GAME, // ?
  [actions.DIALOG_ACTIVATE_NPC_SENTENCE]: journal_msg_levels.GAME,
  [actions.DIALOG_ACTIVATE_PLAYER_SENTENCES]: journal_msg_levels.GAME,
  [actions.INSPECT_BEGIN]: journal_msg_levels.DEBUG, // ?
  [actions.INSPECT_END]: journal_msg_levels.DEBUG, // ?
  [actions.CONTAINER_INIT]: journal_msg_levels.ADMIN,
  [actions.CONTAINER_ADD_ITEM]: journal_msg_levels.ADMIN,
  [actions.CONTAINER_REMOVE_ITEM]: journal_msg_levels.ADMIN,
  [actions.ITEM_CREATE]: journal_msg_levels.ADMIN,
  [actions.ITEM_DELETE]: journal_msg_levels.ADMIN,
  [actions.ITEM_CHANGE_CONTAINER]: journal_msg_levels.ADMIN,
  [actions.MAIN_MENU_CLICK]: journal_msg_levels.DEBUG,
  [actions.MAIN_MENU_SUBELEMENT_CLICK]: journal_msg_levels.DEBUG,
  [actions.INSPECT_FURNITURE_ITEM_CLICK]: journal_msg_levels.DEBUG,
  [actions.INSPECT_FURNITURE_INVENTORY_ITEM_CLICK]: journal_msg_levels.DEBUG,
}

const get_level = (type) => {
  if (!action_to_level[type]) {
    console.log('action_to_level: unknown action type', type);
  }
  return action_to_level[type] ? action_to_level[type] : journal_msg_levels.UNKNOWN
}

export const journal_add_entry = (state, action) => {
  return {...state, data: [...state.data, {action: action, level: get_level(action.type)}]}
}

export const journal_decorate_entry = (entry) => {
  return {level: entry.level, color: msg_level_colors[entry.level], msg: entry.action.type}
}
