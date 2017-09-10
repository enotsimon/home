import React from 'react';
import InputSpinner from 'common/components/input_spinner';
import {game} from "experimental/game";

export default class GenerateWorldForm extends React.Component {

  submit(e) {
    e.preventDefault();
    console.clear();
    game.map_drawer.map.stage.children.forEach(layer => layer.removeChildren());
    game.generate_world();
  }

  render() {
    return (
      <div>
        <form className="form-horizontal">
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
