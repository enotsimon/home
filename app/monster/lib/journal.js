import * as actions from 'monster/actions'
import game from 'monster/monster'

const text = () => game.config.text
const rathni_name = () => text().mobiles.rathni.name

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

// we have human readable texts with localisation only for game level events
const actions_config = {
  [actions.CHANGE_SCENE]: {
    level: journal_msg_levels.GAME,
    text: (action) =>
      `${rathni_name()} ${text().journal.change_scene} ${text().scenes[action.scene_name].name}`,
  },
  [actions.REBUILD_MAIN_MENU]: {
    level: journal_msg_levels.DEBUG,
    text: (action) =>
      `rebuild_main_menu. current_scene: ${action.current_scene.name}`
  },
  [actions.CHANGE_MONEY_AMOUNT]: {
    level: journal_msg_levels.GAME,
    // TODO money_type text
    text: (action) =>
      `${text().journal.change_money_amount} ${action.amount} ${action.money_type}`
  },
  [actions.DRESS_CLOTHES]: {
    level: journal_msg_levels.GAME,
    text: (action) =>
      `${rathni_name()} ${text().journal.dress_clothes} ${text().items[action.item].name}`,
  },
  [actions.INVENTORY_ADD_ITEM]: {
    level: journal_msg_levels.GAME,
    text: (action) =>
      `${rathni_name()} ${text().journal.inventory_add_item} ${text().items[action.item].name}`,
  }, // ?
  [actions.INVENTORY_REMOVE_ITEM]: {
    level: journal_msg_levels.GAME,
    text: (action) =>
      `${rathni_name()} ${text().journal.inventory_remove_item} ${text().items[action.item].name}`,
  },
  [actions.CHANGE_GLOBAL_FLAG]: {
    level: journal_msg_levels.ADMIN,
    text: (action) =>
      `change global flag ${action.name} to '${JSON.stringify(action.value)}'`
  },
  [actions.DIALOG_START]: {
    level: journal_msg_levels.GAME,
    text: (action) =>
      `${text().journal.dialog_start} ${text().mobiles[action.id_mobile].name}`,
  },
  [actions.DIALOG_FINISH]: {
    level: journal_msg_levels.GAME,
    text: (action) =>
      `${text().journal.dialog_finish}`,
  }, // ?
  [actions.DIALOG_NPC_SAYS]: {
    level: journal_msg_levels.GAME,
    text: (action) =>
      `${text().mobiles[action.id_mobile].name}: ${text().dialogs[action.sentence.phrases]}`,
  },
  [actions.DIALOG_PLAYER_SAYS]: {
    level: journal_msg_levels.GAME,
    text: (action) =>
      `${rathni_name()}: ${text().dialogs[action.sentence.phrases]}`,
  },
  [actions.DIALOG_ACTIVATE_PLAYER_SENTENCES]: {
    level: journal_msg_levels.DEBUG,
    text: (action) => 'dialog_activate_player_sentences. sentences: ' + action.sentences.map(e => e.id).join(', '),
  },
  [actions.INSPECT_BEGIN]: {
    level: journal_msg_levels.DEBUG,
    text: (action) => 'inspect_begin',
  }, // ?
  [actions.INSPECT_END]: {
    level: journal_msg_levels.DEBUG,
    text: (action) => 'inspect_end',
  }, // ?
  [actions.CONTAINER_INIT]: {
    level: journal_msg_levels.ADMIN,
    text: (action) => `init container '${action.id_container}'`,
  },
  [actions.CONTAINER_ADD_ITEM]: {
    level: journal_msg_levels.ADMIN,
    text: (action) => `add item '${action.id_item}' to container '${action.id_container}'`,
  },
  [actions.CONTAINER_REMOVE_ITEM]: {
    level: journal_msg_levels.ADMIN,
    text: (action) => `remove item '${action.id_item}' from container '${action.id_container}'`,
  },
  [actions.ITEM_CREATE]: {
    level: journal_msg_levels.ADMIN,
    text: (action) => `create item '${action.id_item}' type '${action.item_type}' in container '${action.id_container}'`,
  },
  [actions.ITEM_DELETE]: {
    level: journal_msg_levels.ADMIN,
    text: (action) => `delete item '${action.id_item}'`,
  },
  [actions.ITEM_CHANGE_CONTAINER]: {
    level: journal_msg_levels.ADMIN,
    text: (action) => `item '${action.id_item}' change container to '${action.id_container}'`,
  },
  [actions.MAIN_MENU_CLICK]: {
    level: journal_msg_levels.DEBUG,
    text: (action) => `main_menu_click '${action.id}'`,
  },
  [actions.MAIN_MENU_SUBELEMENT_CLICK]: {
    level: journal_msg_levels.DEBUG,
    text: (action) => `main_menu_subelement_click '${action.id}'`,
  },
  [actions.INSPECT_FURNITURE_ITEM_CLICK]: {
    level: journal_msg_levels.DEBUG,
    text: (action) => `inspect_furniture_item_click '${action.id_item}'`,
  },
  [actions.INSPECT_FURNITURE_INVENTORY_ITEM_CLICK]: {
    level: journal_msg_levels.DEBUG,
    text: (action) => `inspect_furniture_inventory_item_click '${action.id_item}'`,
  },
}

export const journal_add_entry = (state, action) => {
  if (!actions_config[action.type] && !actions[action.type]) {
    console.log('unknown action', action.type);
    return state
  }
  let level = actions_config[action.type] ? actions_config[action.type].level : journal_msg_levels.UNKNOWN
  return {...state, data: [...state.data, {action: action, level}]}
}

export const journal_decorate_entry = (entry) => {
  let text = game.config.text
  let msg = actions_config[entry.action.type] && actions_config[entry.action.type].text
    ? actions_config[entry.action.type].text(entry.action)
    : entry.action.type
  return {level: entry.level, color: msg_level_colors[entry.level], msg}
}
