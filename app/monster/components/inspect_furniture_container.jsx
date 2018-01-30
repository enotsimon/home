import { connect } from 'react-redux';
import InspectFurniture from 'monster/components/inspect_furniture';
import game from 'monster/monster';
import {inspect_furniture_item_click} from 'monster/actions';
import {INVENTORY} from 'monster/lib/containers'

const get_item_data = (id_item, state) => {
  let item = state.items[id_item]
  let text = game.config.text.items[item.type]
  if (!text) {
    throw({msg: "item text not found in config", id_item})
  }
  return {id_item, text}
}

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
  let inventory = state.containers[INVENTORY];
  if (!inventory) {
    throw({msg: "inventory container not found"});
  }
  return {
    items_list_text: game.config.text.menues.inspect_furniture.items_list,
    pick_up_text: game.config.text.menues.inspect_furniture.pick_up,
    drop_text: game.config.text.menues.inspect_furniture.drop,
    inspect_text: game.config.text.menues.inspect_furniture.inspect,
    inventory_text: game.config.text.menues.inspect_furniture.inventory,
    furniture_name: text.name,
    description: text.description,
    items_list: container.items.map(id_item => get_item_data(id_item, state)),
    inventory_items_list: inventory.items.map(id_item => get_item_data(id_item, state)),
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
    on_drop_item_click: id_item => {
      console.log('on_drop_item_click', id_item);
    },
    on_inspect_item_click: id_item => {
      console.log('on_inspect_item_click', id_item);
    },
  }
}

const InspectFurnitureContainer = connect(state_to_props, dispatch_to_props)(InspectFurniture);

export default InspectFurnitureContainer;
