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
  let dialog_state = state.menues.dialogs
  return {
    player_sentences: dialog_state.player_sentences,
    on_player_sentence_click: handle_player_sentence,
    phrases: dialog_state.phrases.map(e => ({...e, owner: colored_npc_name(e.owner)}))
  };
}

const DialogContainer = connect(state_to_props)(Dialog)
export default DialogContainer
