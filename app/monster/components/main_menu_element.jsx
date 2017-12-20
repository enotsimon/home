
import React from 'react';
import PropTypes from 'prop-types';
import TextEntry from './text_entry';

class MainMenuElement extends React.Component {
  btn_class() {
    let btn_type = this.props.active ? 'btn-success' : 'btn-default';
    return `btn ${btn_type} btn-block`;
  }

  render() {
    return (
      <button id={this.props.id} type="button" className={this.btn_class()} onClick={this.props.on_click}>
        <TextEntry>
          {this.props.text}
        </TextEntry>
      </button>
    );
  }
}

MainMenuElement.propTypes = {
  on_click: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};

export default MainMenuElement;
