
import React from 'react';

export default class Scene extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "bla",
      description: "some desc text",
    };
  }

  render() {
    return (
      <div className="panel panel-success">
        <div className="panel-heading">
          <h4 className="panel-title">
            scene: {this.state.name}
          </h4>
        </div>
        <div className="panel-body">
          {this.state.description}
        </div>
      </div>
    );
  }
}
