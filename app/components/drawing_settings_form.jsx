import React from 'react';
import InputSpinner from 'components/input_spinner';
import {game} from "game";

export default class DrawingSettingsForm extends React.Component {

  submit(e) {
    e.preventDefault();
  }
  
  constructor() {
    super();
  }

  checkbox_handler(event, checkbox_type) {
    game.map_drawer.draw_voronoi_diagram = !game.map_drawer.draw_voronoi_diagram;
    game.map_drawer.set_layers_visibility();
    this.setState({});
  }

  render() {
    return (
      <div>
        <form className="form-horizontal">
          <div className="form-check">
            <label className="form-check-label">
              <input className="form-check-input" type="checkbox" onChange={(e) => this.checkbox_handler(e, 'ds_voronoi_diagram')} checked={game.map_drawer.draw_voronoi_diagram} />
              &nbsp;draw voronoi diagram
            </label>
          </div>
        </form>
      </div>
    );
  }
}
