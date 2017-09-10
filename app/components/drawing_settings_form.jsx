import React from 'react';
import InputSpinner from 'components/input_spinner';
import ActiveCheckbox from 'components/active_checkbox';
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

  create_checkbox(prop_name, text) {
    return React.createElement(ActiveCheckbox, {
      checked: game.map_drawer[prop_name],
      handler: () => {
        game.map_drawer[prop_name] = !game.map_drawer[prop_name];
        game.map_drawer.set_layers_visibility();
        return game.map_drawer[prop_name];
      },
      text: text,
    })
  }

  render() {
    return (
      <div>
        <form className="form-horizontal">
          {this.create_checkbox('draw_voronoi_diagram', 'draw voronoi diagram')}
        </form>
      </div>
    );
  }
}
