// @flow
import game from '../monster'
import * as actions from '../actions'
//import {apply_consequences} from './consequences'
import {check_cond} from './cond'
import type {scene, scene_dialogs} from './../types/scene_types'
import type {
  id_dialog_cell,
  dialog_cell_car,
  dialog_cell_cdr,
  dialog_cell,
  dialog_cell_car_phrase,
  dialog_cell_car_choose,
} from './../types/dialog_types'

// scene -- object, not scene id
export function scene_get_possible_dialogs(scene: scene): Array<scene_dialogs> {
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

export function start_dialog(id_cell: id_dialog_cell): void {
  game.store.dispatch(actions.dialog_start(id_cell))
  handle_dialog_cell(id_cell)
}

export function handle_dialog_cell(id_cell: id_dialog_cell): void {
  let cell = get_cell_from_config(id_cell)
  // TODO before
  if (check_cond(cell.cond)) {
    let proceed_to_cdr = handle_dialog_cell_car(cell.id, cell.car)
    if (!proceed_to_cdr) {
      return
    }
  }
  // TODO after
  handle_dialog_cell_cdr(cell.cdr)
}

// TODO move id_cell to dialog_cell_car_phrase data
function handle_dialog_cell_car(id_cell: id_dialog_cell, cell_car: dialog_cell_car): boolean {
  if (cell_car === null) {
    // nothing, go to cdr
    return true
  } else if (typeof cell_car === 'string') {
    console.log('car goto id', cell_car)
    handle_dialog_cell(cell_car)
    return false
  } else if (cell_car.type === 'phrase') {
    activate_phrase(id_cell, cell_car)
    return true
  } else if (cell_car.type === 'choose') {
    // we do not proceed to cdr
    console.log('we have choose here!', cell_car)
    activate_player_choise(cell_car) // TODO
    return false
  }
  return false
}

function handle_dialog_cell_cdr(cell_cdr: dialog_cell_cdr): void {
  if (cell_cdr === null) {
    console.log('seems like end of dialog', cell_cdr)
    game.store.dispatch(actions.dialog_finish())
  } else if (typeof cell_cdr === 'string') {
    console.log('cdr goto id', cell_cdr)
    handle_dialog_cell(cell_cdr)
  }
}

function activate_phrase(id_cell: id_dialog_cell, cell_car: dialog_cell_car_phrase): void {
  console.log('we got phrase here!', cell_car)
  game.store.dispatch(actions.dialog_phrase({
    owner: cell_car.mobile,
    phrases: cell_car.phrase,
    id: id_cell,
  }))
}

function activate_player_choise(choose: dialog_cell_car_choose): void {
  let phrases = choose.ids.map(prepare_player_choise_object)
  game.store.dispatch(actions.dialog_activate_player_sentences(phrases))
}

/**
 * player_choise_object is NOT dialog cell, not at all
 * @param {*} id_cell
 */
function prepare_player_choise_object(id_cell: id_dialog_cell) {
  let cell = get_cell_from_config(id_cell)
  // phrase should be in cell car anyway, no cdr
  if (cell.car && typeof cell.car === 'string') {
    // if it is a chain of cells, we should set phrase from 'phrase' type cell,
    // but we should write first cell id cause it should
    // be 'activated' on click, not cell with actual phrase
    let next = prepare_player_choise_object(cell.car)
    return {...next, id: cell.id}
  } else if (cell.car && cell.car.type === 'phrase') {
    return {
      id: cell.id,
      owner: cell.car.mobile,
      phrases: cell.car.phrase,
    }
  }
}

function get_cell_from_config(id_cell: id_dialog_cell): dialog_cell {
  let cell = game.config.dialogs[id_cell]
  if (!cell) {
    throw({msg: 'cell not found in dialogs config', id_cell, dialogs: game.config.dialogs})
  }
  return cell
}
