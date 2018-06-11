
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

export function handle_player_sentence(id_cell) {
  console.log('handle_player_sentence', id_cell)
  handle_dialog_cell(id_cell)
}

///////////////////////
// privates
///////////////////////
function handle_dialog_cell(id_cell) {
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
      // FIXME rewtite scheme to just actions.dialog_phrase()
      let func = cell.car.mobile === 'rathni'
        ? actions.dialog_player_says
        : actions.dialog_npc_says
      game.store.dispatch(func({
        owner: cell.car.mobile,
        phrases: cell.car.phrase,
        id: cell.id,
      }))
    } else if (cell.car.type === 'choose') {
      // we do not proceed to cdr
      console.log('we have choose here!', cell.car)
      return activete_player_choise(cell.car) // TODO
    } else {
      console.log('unknown car type', cell)
    }
  }
  // TODO after
  if (cell.cdr) {
    console.log('CDR', cell.id)
    if (typeof cell.cdr === 'string') {
      console.log('cdr goto id', cell.cdr)
      return handle_dialog_cell(cell.cdr)
    } else {
      console.log('unknown cdr type', cell.cdr)
    }
  } else {
    console.log('seems like end of dialog', cell)
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

function get_sentences_from_node(node) {
  return node.sentences.map(id_sentence => {
    if (!game.config.dialogs.sentences[id_sentence]) {
      throw({msg: 'sentence not found in config', id_sentence, node});
    }
    // id prop is hellish hack! it is used in dialog.jsx, be careful!
    return {...game.config.dialogs.sentences[id_sentence], id: id_sentence};
  });
}

function dialog_activate_npc_node(id_node) {
  if (!game.config.dialogs.nodes[id_node]) {
    throw({msg: 'dialog node not found in dialogs config', id_node});
  }
  let node = game.config.dialogs.nodes[id_node];
  // find sutable npc sentence
  let sentences = get_sentences_from_node(node);
  let filtered_sentences = sentences.filter(sentence => check_preconditions(sentence));
  if (filtered_sentences.length === 0) {
    // i dunno, maybe its ok if no sentences in node, but for now throw exception
    throw({msg: 'no sutable sentences in dialog node', node});
  }
  // its okay if there's more than one sutable sentences, we suppose that first one is 'most sutable'
  let sentence = filtered_sentences[0];

  game.store.dispatch(actions.dialog_npc_says(sentence))

  apply_consequences(sentence);

  let player_sentences = prepare_player_sentences(sentence);
  // TODO add some sort of consequences highlight

  // we do it separately from dialog_npc_says for now, but maybe should join together with
  // some pause and using redux-thunk
  game.store.dispatch(actions.dialog_activate_player_sentences(player_sentences));
}

// handle player's node
function  prepare_player_sentences(npc_sentence) {
  if (!npc_sentence.continuation) {
    throw({msg: 'npc sentence should have continuation prop', npc_sentence});
  }
  let player_node = game.config.dialogs.nodes[npc_sentence.continuation];
  if (!player_node) {
    throw({msg: "player's node not found by npc_sentence continuation", npc_sentence});
  }
  // maybe we should remove type prop completely?
  if (player_node.type !== 'player') {
    throw({msg: "player's node type is incorrent (should be 'player')", player_node});
  }
  // copy-paste of dialog_activate_npc_node()
  let sentences = get_sentences_from_node(player_node);
  // TODO add admin mode with possibility to see or even to choose improper sentences
  let filtered_sentences = sentences.filter(sentence => check_preconditions(sentence));
  if (filtered_sentences.length === 0) {
    // i dunno, maybe its ok if no sentences in node, but for now throw exception
    throw({msg: 'no sutable sentences in dialog node', node});
  }
  return filtered_sentences;
}

function get_cell_from_config(id_cell) {
  let cell = game.config.dialogs[id_cell]
  if (!cell) {
    throw({msg: 'cell not found in dialogs config', id_cell, dialogs: game.config.dialogs})
  }
  return cell
}
