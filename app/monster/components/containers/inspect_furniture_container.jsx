import { connect } from 'react-redux';
import InspectFurniture from 'monster/components/inspect_furniture';
import game from 'monster/monster';
import {inspect_furniture_item_click, inspect_furniture_inventory_item_click, inspect_begin} from 'monster/actions'
import {INVENTORY} from 'monster/lib/containers'
import {item_change_container} from 'monster/lib/items'

const get_item_data = (id, state) => {
  if (!id) {
    return {id: null, name: '', description: ''}
  }
  let item = state.items[id]
  let text = game.config.text.items[item.type]
  if (!text) {
    throw({msg: "item text not found in config", id})
  }
  return {...text, id}
}

const state_to_props = state => {
  let menu_state = state.menues.inspect_furniture
  let id_furniture = menu_state.id_furniture
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
    inventory_text: game.config.text.menues.inspect_furniture.inventory,
    furniture: {...text, id: id_furniture},
    items_list: container.items.map(id_item => get_item_data(id_item, state)),
    inventory_items_list: inventory.items.map(id_item => get_item_data(id_item, state)),
    active_item: get_item_data(menu_state.id_item, state),
    inventory_active_item: get_item_data(menu_state.inventory_id_item, state),
  };
}

const dispatch_to_props = dispatch => {
  return {
    on_item_click: (id_item, is_inventory) => {
      dispatch(is_inventory ? inspect_furniture_inventory_item_click(id_item) : inspect_furniture_item_click(id_item));
    },
    on_pick_up_item_click: (id_item, id_furniture) => {
      item_change_container(id_item, INVENTORY)
      dispatch(inspect_begin(id_furniture))
    },
    on_drop_item_click: (id_item, id_furniture) => {
      item_change_container(id_item, id_furniture)
      dispatch(inspect_begin(id_furniture))
    },
  }
}

const InspectFurnitureContainer = connect(state_to_props, dispatch_to_props)(InspectFurniture);

export default InspectFurnitureContainer;
