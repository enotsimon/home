
import React from 'react';

export default class MainMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      go_to: {id: 'go_to', text: "go to"},
      speak_to: {id: 'speak_to', text: "speak to"},
    };
  }

  render() {
    return (
      <div className="panel panel-success">
        <div className="panel-heading">
          <h4 className="panel-title">
            main menu
          </h4>
        </div>
        <div className="panel-body">
          <button id={this.state.go_to.id} type="button" className="btn btn-default btn-block">
            {this.state.go_to.text}
          </button>
          <button id={this.state.speak_to.id} type="button" className="btn btn-default btn-block">
            {this.state.speak_to.text}
          </button>
        </div>
      </div>
    );
  }
}
