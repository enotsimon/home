
import React from 'react';
import PropTypes from 'prop-types';
import TextEntry from './text_entry';

const InspectFurniture = (props) => {
  return (
    <div className="panel panel-success">
      <div className="panel-heading">
        <h4 className="panel-title">
          <TextEntry>
            {props.furniture_name}
          </TextEntry>
        </h4>
      </div>
      <div className="panel-body">
        <TextEntry>
          {props.description}
        </TextEntry>
      </div>
    </div>
  );
}

InspectFurniture.propTypes = {
  furniture_name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default InspectFurniture;