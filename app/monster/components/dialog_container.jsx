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

const mapStateToProps = state => {
  let player_prev_sentence = {id: '', phrases: ''};
  let npc_sentence = {id: '', phrases: ''};
  let player_sentences = [];
  if (state.menues.dialogs.npc_sentence) {
    npc_sentence = sentence_to_props(state.menues.dialogs.npc_sentence);
  }
  if (state.menues.dialogs.player_sentences.length) {
    player_sentences = state.menues.dialogs.player_sentences.map(sentence => sentence_to_props(sentence));
  }
  return {
    player_prev_sentence,
    npc_sentence,
    player_sentences,
    on_player_sentence_click: dialog_handle_chosen_player_sentence,
  };
}

const mapDispatchToProps = dispatch => {
  return {
  };
}


const DialogContainer = connect(mapStateToProps, mapDispatchToProps)(Dialog);

export default DialogContainer;
