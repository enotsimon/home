import React from 'react';
import PropTypes from 'prop-types';
import TextEntry from './text_entry';

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
          <TextEntry>{this.props.player_prev_sentence.phrases}</TextEntry>

          {/* TODO add npc name so we can understand who's speaking */}
          <TextEntry>{this.props.npc_sentence.phrases}</TextEntry>

          {/* TODO add player name so we can understand who's speaking */}
          {this.props.player_sentences.map(sentence => {
            // TODO its not a text but a button!!!
            return (
              <TextEntry key={sentence.id}>{sentence.phrases}</TextEntry>
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
  })).isRequired
};

export default Dialog;
