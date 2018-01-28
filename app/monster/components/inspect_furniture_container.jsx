import { connect } from 'react-redux';
import InspectFurniture from 'monster/components/inspect_furniture';
import game from 'monster/monster';
import {inspect_furniture_item_click} from 'monster/actions';

const state_to_props = state => {
  let id_furniture = state.menues.inspect_furniture.id_furniture
  let text = game.config.text.furniture[id_furniture];
  if (!text) {
    throw({msg: "furniture text not found in config", id_furniture});
  }
  let container = state.containers[id_furniture];
  if (!container) {
    throw({msg: "container not found by id", id_furniture});
  }
  return {
    items_list_text: game.config.text.menues.inspect_furniture.items_list,
    pick_up_text: game.config.text.menues.inspect_furniture.pick_up_text,
    inspect_text: game.config.text.menues.inspect_furniture.inspect_text,
    furniture_name: text.name,
    description: text.description,
    items_list: container.items.map(id_item => {
      let item = state.items[id_item]
      let text = game.config.text.items[item.type]
      if (!text) {
        throw({msg: "item text not found in config", id_item})
      }
      return {id_item, text}
    }),
    active_item: state.menues.inspect_furniture.id_item,
  };
}

const dispatch_to_props = dispatch => {
  return {
    on_item_click: id_item => {
      dispatch(inspect_furniture_item_click(id_item));
    },
    on_pick_up_item_click: id_item => {
      console.log('on_pick_up_item_click', id_item);
    },
    on_inspect_item_click: id_item => {
      console.log('on_inspect_item_click', id_item);
    },
  }
}

const InspectFurnitureContainer = connect(state_to_props, dispatch_to_props)(InspectFurniture);

export default InspectFurnitureContainer;
