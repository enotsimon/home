import { connect } from 'react-redux';
import InspectFurniture from 'monster/components/inspect_furniture';
import game from 'monster/monster';
import {dialog_handle_chosen_player_sentence} from 'monster/dialogs';

const state_to_props = state => {
  let text = game.config.text.furniture[state.inspect.id_furniture];
  if (!text) {
    throw({msg: "furniture text not found in config", id_furniture: state.inspect.id_furniture});
  }
  return {
    furniture_name: text.name,
    description: text.description,
  };
}

const InspectFurnitureContainer = connect(state_to_props)(InspectFurniture);

export default InspectFurnitureContainer;
