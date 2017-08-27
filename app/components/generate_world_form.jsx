import React from 'react';
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
            <div className="col-sm-offset-6 col-sm-6">
              <button type="button" className="btn btn-default" id="generate_world" onClick={this.submit.bind(this)}>generate</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
