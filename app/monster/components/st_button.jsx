
import React from 'react';
import PropTypes from 'prop-types';

class StButton extends React.Component {
  btn_class() {
    let btn_type = !this.props.active ? 'btn-default' : 'btn-success';
    return `btn ${btn_type} btn-block`;
  }

  render() {
    return (
      <button
        //id={this.props.id}
        type="button"
        className={this.btn_class()}
        onClick={this.props.on_click}
        // by default button is enabled
        disabled={this.props.enabled === false ? 'disabled' : ''}
      >
        <div className='text-left'>
          {this.props.children}
        </div>
      </button>
    );
  }
}

StButton.propTypes = {
  //id: PropTypes.string.isRequired,
  on_click: PropTypes.func.isRequired,
  // active only means it is highlighted with green color
  active: PropTypes.bool,
  enabled: PropTypes.bool,
};

export default StButton;
