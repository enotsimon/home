
import React from 'react';
import PropTypes from 'prop-types';
import TextEntry from './text_entry';
import StButton from './st_button';

class MainMenuElement extends React.Component {
  btn_class() {
    let btn_type = this.props.active ? 'btn-success' : 'btn-default';
    return `btn ${btn_type} btn-block`;
  }

  render() {
    return (
      <StButton on_click={this.props.on_click} enabled={this.props.enabled} active={this.props.active}>
        <TextEntry>
          {this.props.text}
        </TextEntry>
      </StButton>
    );
  }
}

MainMenuElement.propTypes = {
  on_click: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired,
};

export default MainMenuElement;
