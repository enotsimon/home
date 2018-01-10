import { connect } from 'react-redux'
import Dialog from 'monster/components/dialog';
import game from 'monster/monster';
import {dialog_handle_chosen_player_sentence} from 'monster/dialogs';

function sentence_to_props(sentence) {
  if (!game.config.text.dialogs[sentence.phrases]) {
    throw({msg: 'sentence phrases not found in game.config.text.dialogs', sentence});
  }
  return {
    id: sentence.id,
    phrases: game.config.text.dialogs[sentence.phrases],
  };
}

function colored_npc_name(id_mobile) {
  if (id_mobile && !game.config.text.mobiles[id_mobile]) {
    throw({msg: 'mobile not found in game.config.text.mobiles', id_mobile});
  }
  // a trick to get npc name colored in 'mobile' color
  return id_mobile ? '{' + game.config.text.mobiles[id_mobile].name + '|mobiles|' + id_mobile + '}' : '';
}

const mapStateToProps = state => {
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
    npc_name: colored_npc_name(dialog_state.id_mobile),
    player_prev_sentence,
    npc_sentence,
    player_sentences,
    on_player_sentence_click: dialog_handle_chosen_player_sentence,
  };
}

const DialogContainer = connect(mapStateToProps)(Dialog);

export default DialogContainer;
