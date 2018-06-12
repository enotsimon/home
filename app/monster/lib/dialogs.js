
import game from '../monster'
import * as actions from '../actions'
import {check_preconditions} from './preconditions'
import {apply_consequences} from './consequences'

// scene -- object, not scene id
export function scene_get_possible_dialogs(scene) {
  return (scene.dialogs || []).map(e => {
    if (!e.talkers) {
      throw({msg: "dialog config has no 'talkers' prop"})
    }
    if (!e.node) {
      throw({msg: "dialog config has no 'node' prop"})
    }
    return e
  })
}

export function start_dialog(id_cell) {
  game.store.dispatch(actions.dialog_start(id_cell))
  handle_dialog_cell(id_cell)
}

export function handle_dialog_cell(id_cell) {
  let cell = get_cell_from_config(id_cell)
  let cond_fulfilled = true
  if (cell.cond) {
    // TODO apply cond
    cond_fulfilled = true
  }
  // TODO before
  if (cond_fulfilled && cell.car) {
    if (cell.car === null) {
      console.log('null node, goto cdr', cell.id)
    } else if (typeof cell.car === 'string') {
      console.log('car goto id', cell.car)
      return handle_dialog_cell(cell.car)
    } else if (cell.car.type === 'phrase') {
      console.log('we got phrase here!', cell.car)
      game.store.dispatch(actions.dialog_phrase({
        owner: cell.car.mobile,
        phrases: cell.car.phrase,
        id: cell.id,
      }))
    } else if (cell.car.type === 'choose') {
      // we do not proceed to cdr
      console.log('we have choose here!', cell.car)
      return activete_player_choise(cell.car) // TODO
    } else {
      throw({msg: 'unknown car type', cell})
    }
  }
  // TODO after
  if (cell.cdr) {
    console.log('CDR', cell.id)
    if (typeof cell.cdr === 'string') {
      console.log('cdr goto id', cell.cdr)
      return handle_dialog_cell(cell.cdr)
    } else {
      throw({msg: 'unknown cdr type', cell})
    }
  } else {
    console.log('seems like end of dialog', cell)
    // TODO add (end of dialog) fake node
    game.store.dispatch(actions.dialog_finish())
  }
}

function activete_player_choise(choose) {
  let phrases = choose.ids.map(prepare_player_choise_object)
  game.store.dispatch(actions.dialog_activate_player_sentences(phrases))
}

/**
 * player_choise_object is NOT dialog cell, not at all
 * @param {*} id_cell
 */
function prepare_player_choise_object(id_cell) {
  let cell = get_cell_from_config(id_cell)
  // phrase should be in cell car anyway, no cdr
  if (cell.car && cell.car.type === 'phrase') {
    return {
      id: cell.id,
      owner: cell.car.mobile,
      phrases: cell.car.phrase,
    }
  } else if (cell.car && typeof cell.car === 'string') {
    // if it is a chain of cells, we should set phrase from 'phrase' type cell,
    // but we should write first cell id cause it should
    // be 'activated' on click, not cell with actual phrase
    let next = prepare_player_choise_object(cell.car)
    return {...next, id: cell.id}
  } else {
    // TODO is it correct?
    throw({msg: 'cannot find phrase in choose option', cell})
  }
}

function get_cell_from_config(id_cell) {
  let cell = game.config.dialogs[id_cell]
  if (!cell) {
    throw({msg: 'cell not found in dialogs config', id_cell, dialogs: game.config.dialogs})
  }
  return cell
}
