
import game from '../monster'
import * as actions from '../actions'
import {check_preconditions} from './preconditions'
import {apply_consequences} from './consequences'

export function start_dialog(id_mobile) {
  if (!game.config.dialogs.mobiles[id_mobile]) {
    throw({msg: 'unknown dialog owner', id_mobile});
  }
  game.store.dispatch(actions.dialog_start(id_mobile));
  let id_node = game.config.dialogs.mobiles[id_mobile].root_node;
  dialog_activate_npc_node(id_node);
}

export function handle_player_sentence(id_sentence) {
  if (!game.config.dialogs.sentences[id_sentence]) {
    throw({msg: 'current dialog sentence not found in dialogs config', id_sentence});
  }
  let sentence = game.config.dialogs.sentences[id_sentence];
  apply_consequences(sentence);
  game.store.dispatch(actions.dialog_player_says(sentence));
  // sentence.continuation = null is okay and means dialog is finished
  if (sentence.continuation === null) {
    game.store.dispatch(actions.dialog_finish());
  } else {
    dialog_activate_npc_node(sentence.continuation);
  }
}

///////////////////////
// privates
///////////////////////
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

  game.store.dispatch(actions.dialog_npc_says(sentence, sentence.owner));

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
