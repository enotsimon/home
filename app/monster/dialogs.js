
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

function dialog_activate_npc_node(node) {
  // find sutable npc sentence
  let sentences = node.sentences.map(id_sentence => {
    if (!game.config.dialogs.sentences[id_sentence]) {
      throw({msg: 'sentence not found in config', id_sentence});
    }
    return game.config.dialogs.sentences[id_sentence];
  });
  filtered_sentences = sentences.filter(sentence => check_preconditions(sentence));
  if (filtered_sentences.length === 0) {
    // i dunno, maybe its ok if no sentences in node, but for now throw exception
    throw({msg: 'no sutable sentences in dialog node', node});
  } else if (filtered_sentences.length > 1) {
    console.log('more than one filtered sentences', filtered_sentences, 'node', node);
  }
  let sentence = filtered_sentences[0];

  // show (trigger 'show') of this sentence some way
  //game.store.dispatch(actions.dialog_activate_npc_sentence(sentence));

  apply_aftermath(sentence);

  // prepare and show possible player's sentences
  // TODO
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
  if (!precondition.name || typeof s !== 'string') {
    throw({msg: "precondition of flag type should has 'name' property and it should be string", precondition});
  }
  if (!precondition.value) {
    throw({msg: "precondition of flag type should has 'value' property", precondition});
  }
  let state = game.store.getState();
  return state.flags[precondition.name] == precondition.value;
}



///////////////////////////
// aftermath
///////////////////////////
function apply_aftermath(sentence) {
  if (!sentence.aftermath) {
    return true;
  }
  sentence.aftermath.forEach(e => {
    // TODO
  });
}
