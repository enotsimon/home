import React from 'react';
import PropTypes from 'prop-types';
import TextEntry from './text_entry';
import StButton from './st_button';

class Dialog extends React.Component {
  render() {
    return (
      <div className="panel panel-success">
        <div className="panel-heading">
          <h4 className="panel-title">
            dialog
          </h4>
        </div>
        <div className="panel-body">
          {/* TODO add player name so we can understand who's speaking */}
          <p><TextEntry>{this.props.player_prev_sentence.phrases}</TextEntry></p>

          {/* TODO add npc name so we can understand who's speaking */}
          <p><TextEntry>{this.props.npc_sentence.phrases}</TextEntry></p>

          {/* TODO add player name so we can understand who's speaking */}
          {this.props.player_sentences.map(sentence => {
            return (
              <StButton key={sentence.id} on_click={() => this.props.on_player_sentence_click(sentence.id)}>
                <TextEntry>
                  {sentence.phrases}
                </TextEntry>
              </StButton>
            );
          })}
        </div>
      </div>
    );
  }
}

Dialog.propTypes = {
  player_prev_sentence: PropTypes.shape({
    id: PropTypes.string.isRequired,
    phrases: PropTypes.any.isRequired,
  }).isRequired,
  npc_sentence: PropTypes.shape({
    id: PropTypes.string.isRequired,
    phrases: PropTypes.any.isRequired,
  }).isRequired,
  player_sentences: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    phrases: PropTypes.any.isRequired,
  })).isRequired,
  on_player_sentence_click: PropTypes.func.isRequired,
};

export default Dialog;
