import { connect } from 'react-redux'
import Dialog from 'monster/components/dialog';
import game from 'monster/monster';


const mapStateToProps = state => {
  return {
    player_prev_sentence: {
      id: '',
      phrases: '',
    },
    npc_sentence: {
      id: '',
      phrases: '',
    },
    player_sentences: [
      {
        id: '',
        phrases: '',
      },
    ]
  };
}

const mapDispatchToProps = dispatch => {
  return {
  };
}


const DialogContainer = connect(mapStateToProps, mapDispatchToProps)(Dialog);

export default DialogContainer;
