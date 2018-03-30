import React from 'react'
import PropTypes from 'prop-types'

// TODO maybe move it to common components
const PlusButton = (props) => {
  return (
    <span className='btn btn-success' onClick={props.on_click}>
      <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
    </span>
  )
}

PlusButton.propTypes = {
  on_click: PropTypes.func.isRequired,
}

export default PlusButton
