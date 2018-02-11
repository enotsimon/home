import React from 'react';
import PropTypes from 'prop-types';

const StButton = (props) => {
  let {active: active = false, enabled: enabled = true, block: block = true, extra_classes: extra_classes = ''} = props
  let btn_type = !active ? 'btn-default' : 'btn-success'
  let btn_block = block ? 'btn-block' : ''
  let btn_class = `btn ${btn_type} ${btn_block} ${extra_classes}`

  return (
    <button
      type="button"
      className={btn_class}
      onClick={props.on_click}
      // by default button is enabled
      disabled={enabled === false ? 'disabled' : ''}
    >
      <div className='text-left'>
        {props.children}
      </div>
    </button>
  );
}

StButton.propTypes = {
  on_click: PropTypes.func.isRequired,
  // active only means it is highlighted with green color
  active: PropTypes.bool,
  enabled: PropTypes.bool,
  block: PropTypes.bool,
  extra_classes: PropTypes.string,
};

export default StButton;
