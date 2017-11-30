
import React from 'react';
import PropTypes from 'prop-types';

class MainMenuElement extends React.Component {
  render() {
    console.log('MainMenuElement', this.props);

    return (
      <button id={this.props.id} type="button" className="btn btn-default btn-block" onClick={this.props.on_click}>
        {this.props.text}
      </button>
    );
  }
}

MainMenuElement.propTypes = {
  on_click: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default MainMenuElement;
