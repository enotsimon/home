
import React from 'react';
import PropTypes from 'prop-types';

class MainMenuSubelement extends React.Component {
  render() {
    return (
      <button id={this.props.id} type="button" className="btn btn-block btn-default" onClick={this.props.on_click}>
        {this.props.text}
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
