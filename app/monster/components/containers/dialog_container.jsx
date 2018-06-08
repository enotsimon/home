import { connect } from 'react-redux'
import Dialog from 'monster/components/dialog';
import game from 'monster/monster';
import {handle_player_sentence} from 'monster/lib/dialogs'

function sentence_to_props(sentence) {
  return {
    id: sentence.id,
    phrases: sentence.phrases,
  };
}

function colored_npc_name(id_mobile) {
  if (id_mobile && !game.config.text.mobiles[id_mobile]) {
    throw({msg: 'mobile not found in game.config.text.mobiles', id_mobile});
  }
  // a trick to get npc name colored in 'mobile' color
  return id_mobile ? '{' + game.config.text.mobiles[id_mobile].name + '|mobiles|' + id_mobile + '}' : '';
}

const state_to_props = state => {
  let dialog_state = state.menues.dialogs;
  let player_prev_sentence = {id: '', phrases: ''};
  let npc_sentence = {id: '', phrases: ''};
  let player_sentences = [];
  if (dialog_state.npc_sentence) {
    npc_sentence = sentence_to_props(dialog_state.npc_sentence);
  }
  if (dialog_state.player_sentences.length) {
    player_sentences = dialog_state.player_sentences.map(sentence => sentence_to_props(sentence));
  }
  return {
    npc_name: colored_npc_name(dialog_state.npc_sentence.owner),
    player_prev_sentence,
    npc_sentence,
    player_sentences,
    on_player_sentence_click: handle_player_sentence,
  };
}

const DialogContainer = connect(state_to_props)(Dialog);

export default DialogContainer;
