
import React from 'react';
import PropTypes from 'prop-types';
import TextEntry from './text_entry';
import StButton from './st_button';

class MainMenuSubelement extends React.Component {
  render() {
    return (
      <StButton on_click={this.props.on_click}>
        <TextEntry>
          {this.props.text}
        </TextEntry>
      </StButton>
    );
  }
}

MainMenuSubelement.propTypes = {
  on_click: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default MainMenuSubelement;
