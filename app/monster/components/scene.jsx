
import React from 'react';
import PropTypes from 'prop-types';
import TextEntry from './text_entry';

class Scene extends React.Component {
  render() {
    return (
      <div className="panel panel-success">
        <div className="panel-heading">
          <h4 className="panel-title">
            scene:&nbsp;
            <TextEntry>
              {this.props.name}
            </TextEntry>
          </h4>
        </div>
        <div className="panel-body">
          <TextEntry>
            {this.props.description}
          </TextEntry>
        </div>
      </div>
    );
  }
}

Scene.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default Scene;