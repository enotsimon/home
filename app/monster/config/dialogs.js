
/**
 *  'mobiles' section is for defining root nodes for npcs
 *
 *  all dialogs consist of nodes
 *  node is an array of sentences or propositions
 *  node can be of npc or of player type
 *  if node is of npc type, then only one of sentences is active at a time
 *    so we pick sentences from sentences array one by one, check their preconditions, choose
 *    first sutable and then apply it -- show on UI in dialog list
 *  if node is of player type, then sentences work like different options to choose by player
 *    so we gather them all, filter them by their preconditions and then show all whats left
 *    on UI as a list of possible player's answers to previous npc proposition
 *
 *  sentence is an object that consits of
 *    preconditions -- array of callbacks that run to check if this sentence is availible
 *    consequences -- array of callbacks that run after this sentence 'activation'
 *    continuation -- node id -- it is a dialog continuation, like an opponent's answer to this sentence
 *    phrases -- id of text entry with certain text of this sentence
 */

const dialogs = {
  mobiles: {
    tricky_bell: {
      root_node: 'tricky_bell_root',
    },
  },


  nodes: {

    tricky_bell_root: {
      type: 'npc',
      owner: 'tricky_bell', // ???
      sentences: [
        'tricky_bell_init',
        'tricky_bell_1',
      ],
    },

    tricky_bell_2: {
      type: 'npc',
      owner: 'tricky_bell', // ???
      sentences: [
        'tricky_bell_2',
      ],
    },

    on_tricky_bell_init: {
      type: 'player',
      owner: null, // no meaning any way
      sentences: [
        'on_tricky_bell_init_1',
        'on_tricky_bell_init_2',
        'on_tricky_bell_init_3',
      ],
    },

    on_tricky_bell_1: {
      type: 'player',
      sentences: [
        'on_tricky_bell_1_1',
        'on_tricky_bell_1_2',
        'on_tricky_bell_1_3',
      ],
    },

    on_tricky_bell_2: {
      type: 'player',
      sentences: [
        'on_tricky_bell_2',
      ],
    },

  },


  sentences: {

    tricky_bell_init: {
      phrases: 'tricky_bell_init',
      preconditions: [
        {type: 'flag', name: 'tricky_bell_init', value: false},
      ],
      consequences: [
        {type: 'flag', name: 'tricky_bell_init', value: true},
      ],
      continuation: 'on_tricky_bell_init',
    },

    tricky_bell_1: {
      phrases: 'tricky_bell_1',
      continuation: 'on_tricky_bell_1',
    },

    tricky_bell_2: {
      phrases: 'tricky_bell_2',
      continuation: 'on_tricky_bell_2',
    },

    on_tricky_bell_init_1: {
      phrases: 'on_tricky_bell_init_1',
      continuation: 'tricky_bell_2',
    },

    on_tricky_bell_init_2: {
      phrases: 'on_tricky_bell_init_2',
      continuation: 'tricky_bell_2',
    },

    on_tricky_bell_init_3: {
      phrases: 'on_tricky_bell_init_3',
      continuation: 'tricky_bell_2',
    },

    on_tricky_bell_1_1: {
      phrases: 'on_tricky_bell_1_1',
      continuation: 'tricky_bell_2',
    },

    on_tricky_bell_1_2: {
      phrases: 'on_tricky_bell_1_2',
      continuation: 'tricky_bell_2',
    },

    on_tricky_bell_1_3: {
      phrases: 'on_tricky_bell_1_3',
      continuation: 'tricky_bell_2',
    },

    on_tricky_bell_2: {
      phrases: 'on_tricky_bell_2',
      continuation: null,
    }
  },

};

export default dialogs;
