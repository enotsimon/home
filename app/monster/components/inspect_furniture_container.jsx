import { connect } from 'react-redux';
import InspectFurniture from 'monster/components/inspect_furniture';
import game from 'monster/monster';

const state_to_props = state => {
  let text = game.config.text.furniture[state.inspect.id_furniture];
  if (!text) {
    throw({msg: "furniture text not found in config", id_furniture: state.inspect.id_furniture});
  }
  let container = state.containers[state.inspect.id_furniture];
  if (!container) {
    throw({msg: "container not found by id", id_furniture: state.inspect.id_furniture});
  }
  return {
    furniture_name: text.name,
    description: text.description,
    items_list_text: game.config.text.menues.inspect_furniture.items_list,
    items_list: container.items.map(id_item => {
      let item = state.items[id_item]
      let text = game.config.text.items[item.type]
      if (!text) {
        throw({msg: "item text not found in config", id_item})
      }
      return text
    })
  };
}

const InspectFurnitureContainer = connect(state_to_props)(InspectFurniture);

export default InspectFurnitureContainer;
