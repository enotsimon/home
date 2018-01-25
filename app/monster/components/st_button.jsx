
import React from 'react';
import PropTypes from 'prop-types';

const btn_class = (active) => {
  let btn_type = !active ? 'btn-default' : 'btn-success';
  return `btn ${btn_type} btn-block`;
}

const StButton = ({on_click: on_click, active: active = false, enabled: enabled = true, children: children}) => {
  return (
    <button
      type="button"
      className={btn_class(active)}
      onClick={on_click}
      // by default button is enabled
      disabled={enabled === false ? 'disabled' : ''}
    >
      <div className='text-left'>
        {children}
      </div>
    </button>
  );
}

StButton.propTypes = {
  //id: PropTypes.string.isRequired,
  on_click: PropTypes.func.isRequired,
  // active only means it is highlighted with green color
  active: PropTypes.bool,
  enabled: PropTypes.bool,
};

export default StButton;
