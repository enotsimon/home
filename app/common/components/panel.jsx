import React from 'react'
import PropTypes from 'prop-types'

const Panel = (props) => {
  return (
    <div className="panel panel-success">
      <div className="panel-heading">
        <h4 className="panel-title">
          {props.header}
        </h4>
      </div>
      <div className="panel-body">
        {props.children}
      </div>
    </div>
  );
}

Panel.propTypes = {
  header: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
}

export default Panel
