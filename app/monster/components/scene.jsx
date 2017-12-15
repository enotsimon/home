
import React from 'react';
import PropTypes from 'prop-types';

class Scene extends React.Component {
  render() {
    return (
      <div className="panel panel-success">
        <div className="panel-heading">
          <h4 className="panel-title">
            scene: {this.props.name}
          </h4>
        </div>
        <div className="panel-body">
          {this.props.description}
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