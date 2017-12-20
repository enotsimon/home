
import React from 'react';
import PropTypes from 'prop-types';
import TextEntry from './text_entry';

class MainMenuSubelement extends React.Component {
  render() {
    return (
      <button id={this.props.id} type="button" className="btn btn-default btn-block" onClick={this.props.on_click}>
        <TextEntry>
          {this.props.text}
        </TextEntry>
      </button>
    );
  }
}

MainMenuSubelement.propTypes = {
  on_click: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default MainMenuSubelement;
