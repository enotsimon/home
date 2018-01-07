
import game from './monster';
import * as actions from './actions';

export function dialog_start(id_mobile) {
  if (!game.config.dialogs.mobiles[id_mobile]) {
    throw({msg: 'unknown dialog owner', id_mobile});
  }
  game.store.dispatch(actions.dialog_start());
  let id_node = game.config.dialogs.mobiles[id_mobile].root_node;
  dialog_activate_node(id_node);
}

// 'activate' meant dispatch some sort of 'show dialog sentence' action
// ???
export function dialog_activate_node(id_node) {
  let node = game.config.dialogs.nodes[id_node];
  if (node.type = 'npc') {
    dialog_activate_npc_node(node);
  } else if (node.type = 'player') {
    dialog_activate_player_node(node);
    // ???
    //bound_dialog_activate_node(id_node)
  } else {
    throw({msg: 'unknown dialog node type', id_node, type: node.type});
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
    return game.config.dialogs.sentences[id_sentence];
  });
}

function dialog_activate_npc_node(node) {
  // find sutable npc sentence
  let sentences = get_sentences_from_node(node);
  filtered_sentences = sentences.filter(sentence => check_preconditions(sentence));
  if (filtered_sentences.length === 0) {
    // i dunno, maybe its ok if no sentences in node, but for now throw exception
    throw({msg: 'no sutable sentences in dialog node', node});
  } else if (filtered_sentences.length > 1) {
    console.log('more than one filtered sentences', filtered_sentences, 'node', node);
  }
  let sentence = filtered_sentences[0];

  game.store.dispatch(actions.dialog_activate_npc_sentence(sentence));

  apply_consequences(sentence);

  let player_sentences = prepare_player_sentences(sentence);
  // TODO add some sort of consequences highlight

  // we do it separately from dialog_activate_npc_sentence for now, but maybe should join together with
  // some pause and using redux-thunk
  game.store.dispatch(actions.dialog_activate_player_sentences(player_sentences));
}


///////////////////////////
// preconditions
///////////////////////////
function check_preconditions(sentence) {
  if (!sentence.preconditions) {
    return true;
  }
  return sentence.preconditions.every(precondition => check_precondition(precondition));
}

function check_precondition(precondition) {
  if (!precondition.type) {
    throw({msg: 'precondition has no type', precondition});
  }
  switch (precondition.type) {
    case 'flag':
      return check_precondition_of_flag_type(precondition);
    default:
      throw({msg: 'unknown precondition type', precondition});
  }
}

function check_precondition_of_flag_type(precondition) {
  if (!precondition.name || typeof precondition.name !== 'string') {
    throw({msg: "precondition of flag type should has 'name' property and it should be string", precondition});
  }
  if (!precondition.value) {
    throw({msg: "precondition of flag type should has 'value' property", precondition});
  }
  let state = game.store.getState();
  console.log('check_precondition_of_flag_type', precondition.name, precondition.value); // DEBUG
  return state.flags[precondition.name] == precondition.value;
}



///////////////////////////
// consequences
///////////////////////////
function apply_consequences(sentence) {
  if (!sentence.consequences) {
    return true;
  }
  sentence.consequences.forEach(consequence => apply_consequence(consequence));
}

// TODO same as check_precondition()
function apply_consequence(consequence) {
  if (!consequence.type) {
    throw({msg: 'consequence has no type', consequence});
  }
  switch (consequence.type) {
    case 'flag':
      return apply_consequence_of_flag_type(consequence);
    default:
      throw({msg: 'unknown consequence type', consequence});
  }
}

// TODO same as check_precondition_of_flag_type()
function apply_consequence_of_flag_type(consequence) {
  if (!consequence.name || typeof consequence.name !== 'string') {
    throw({msg: "consequence of flag type should has 'name' property and it should be string", consequence});
  }
  if (!consequence.value) {
    throw({msg: "consequence of flag type should has 'value' property", consequence});
  }
  game.store.dispatch(actions.change_global_flag(consequence.name, consequence.value));
}



////////////////////////////
// consecution
////////////////////////////

// handle player's node
function  prepare_player_sentences(npc_sentence) {
  if (!npc_sentence.consecution) {
    throw({msg: 'npc sentence should have consecution pop', npc_sentence});
  }
  let player_node = game.config.dialogs.nodes[sentence.consecution];
  if (!player_node) {
    throw({msg: "player's node not found by npc_sentence consecution ", npc_sentence});
  }
  if (!player_node) {
    throw({msg: "player's node not found by npc_sentence consecution ", npc_sentence});
  }
  // maybe we should 
  if (player_node.type !== 'player') {
    throw({msg: "player's node type is incorrent (should be 'player')", player_node});
  }
  // copy-paste of dialog_activate_npc_node()
  let sentences = get_sentences_from_node(player_node);
  // TODO add admin mode with possibility to see or even to choose improper sentences
  filtered_sentences = sentences.filter(sentence => check_preconditions(sentence));
  if (filtered_sentences.length === 0) {
    // i dunno, maybe its ok if no sentences in node, but for now throw exception
    throw({msg: 'no sutable sentences in dialog node', node});
  }
  return filtered_sentences;
}
