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
      `rebuild main menu. current_scene: ${action.current_scene.name}`
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
      `change global flag ${action.name} to ${JSON.stringify(action.value)}`
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
  [actions.DIALOG_ACTIVATE_NPC_SENTENCE]: {
    level: journal_msg_levels.GAME,
    text: (action) => {
      let id_mobile = game.store.getState().menues.dialogs.id_mobile
      if (!id_mobile) {
        return 'suk suk suk'
      }
      console.log('DIALOG_ACTIVATE_NPC_SENTENCE', id_mobile, action.sentence.phrases)
      return `${text().mobiles[id_mobile].name}: ${text().dialogs[action.sentence.phrases]}`
    }
  },
  [actions.DIALOG_ACTIVATE_PLAYER_SENTENCES]: {
    level: journal_msg_levels.GAME,
    text: (action) => {
      let id_mobile = game.store.getState().menues.dialogs.id_mobile
      if (!id_mobile) {
        return 'pak pak pak'
      }
      console.log('DIALOG_ACTIVATE_PLAYER_SENTENCES', action.sentences)
      //return `${rathni_name()}: ${text().dialogs[action.sentence.phrases]}`
      return `${rathni_name()}: bla`
    }
  },
  [actions.INSPECT_BEGIN]: {level: journal_msg_levels.DEBUG}, // ?
  [actions.INSPECT_END]: {level: journal_msg_levels.DEBUG}, // ?
  [actions.CONTAINER_INIT]: {level: journal_msg_levels.ADMIN},
  [actions.CONTAINER_ADD_ITEM]: {level: journal_msg_levels.ADMIN},
  [actions.CONTAINER_REMOVE_ITEM]: {level: journal_msg_levels.ADMIN},
  [actions.ITEM_CREATE]: {level: journal_msg_levels.ADMIN},
  [actions.ITEM_DELETE]: {level: journal_msg_levels.ADMIN},
  [actions.ITEM_CHANGE_CONTAINER]: {level: journal_msg_levels.ADMIN},
  [actions.MAIN_MENU_CLICK]: {level: journal_msg_levels.DEBUG},
  [actions.MAIN_MENU_SUBELEMENT_CLICK]: {level: journal_msg_levels.DEBUG},
  [actions.INSPECT_FURNITURE_ITEM_CLICK]: {level: journal_msg_levels.DEBUG},
  [actions.INSPECT_FURNITURE_INVENTORY_ITEM_CLICK]: {level: journal_msg_levels.DEBUG},
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
