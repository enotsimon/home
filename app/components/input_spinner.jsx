import React from 'react';
import {game} from "game";

export default class InputSpinner extends React.Component {

  constructor(args) {
    super(args);
    this.state = {value: game.rrt_epsilon};
    this.name = args.name;
    this.min = args.min ? args.min : 0;
    this.max = args.max ? args.max : Infinity;
  }

  click_up(e) {
    if (this.state.value >= this.max) {
      return false;
    }
    this.update_value(this.state.value + 1);
    e.preventDefault();
  }

  click_down(e) {
    if (this.state.value <= this.min) {
      return false;
    }
    this.update_value(this.state.value - 1);
    e.preventDefault();
  }

  manual_set(e) {
    this.update_value(e.target.value);
  }

  update_value(new_value) {
    this.setState({value: new_value});
  }

  render() {
    return (
      <div className="input-group">
        <span className="input-group-btn">
          <a className="btn btn-danger" onClick={this.click_down.bind(this)}><span className="glyphicon glyphicon-minus"></span></a>
        </span>
        <input type="text" className="form-control text-center" value={this.state.value} onChange={this.manual_set.bind(this)}/>
        <span className="input-group-btn">
          <a className="btn btn-info" onClick={this.click_up.bind(this)}><span className="glyphicon glyphicon-plus"></span></a>
        </span>
      </div>
    );
  }
}
