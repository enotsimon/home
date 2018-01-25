import React from 'react';
import PropTypes from 'prop-types';
import TextEntry from './text_entry';
import StButton from './st_button';
import {SimplePanelSuccess} from 'common/components/panel'

class Dialog extends React.Component {
  mobile_name(name) {
    return name ? (<span><TextEntry>{name}</TextEntry>:&nbsp;</span>) : '';
  }

  render() {
    return (
      <SimplePanelSuccess title="dialog">
          
        {/* TODO add player name so we can understand who's speaking */}
        <p><TextEntry>{this.props.player_prev_sentence.phrases}</TextEntry></p>

        <p>
          {this.mobile_name(this.props.npc_name)}
          <TextEntry>{this.props.npc_sentence.phrases}</TextEntry>
        </p>

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
        
      </SimplePanelSuccess>
    );
  }
}

Dialog.propTypes = {
  player_prev_sentence: PropTypes.shape({
    id: PropTypes.string.isRequired,
    phrases: PropTypes.any.isRequired,
  }).isRequired,
  npc_name: PropTypes.any.isRequired,
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
