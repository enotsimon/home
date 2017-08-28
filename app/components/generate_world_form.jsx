import React from 'react';
import InputSpinner from 'components/input_spinner';
import {game} from "game";

export default class GenerateWorldForm extends React.Component {

  submit(e) {
    e.preventDefault();
    console.clear();
    game.map_drawer.map.stage.children.forEach(layer => layer.removeChildren());
    game.generate_map();
  }

  render() {
    return (
      <div>
        <form className="form-horizontal">
          <div className="form-group">
            <label htmlFor="epsilon" className="col-sm-4 control-label">rrt diagram epsilon</label>
            <div className="col-sm-8"><InputSpinner name='rrt_epsilon' value={game.rrt_epsilon}/></div>
          </div>
          <div className="form-group">
            <div className="col-sm-offset-4 col-sm-8">
              <button type="button" className="btn btn-default" id="generate_world" onClick={this.submit.bind(this)}>generate</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
