
export const CHANGE_SCENE = 'change_scene';
export const CHANGE_MONEY_AMOUNT = 'change_money_amount';
export const DRESS_CLOTHES = 'dress_clothes';
export const INVENTORY_ADD_ITEM = 'inventory_add_item';
export const INVENTORY_REMOVE_ITEM = 'inventory_remove_item';
export const CHANGE_GLOBAL_FLAG = 'change_global_flag';


// config?
export function change_scene(scene_name, config) {
  return {type: CHANGE_SCENE, scene_name};
}

export function change_money_amount(money_type, amount) {
  return {type: CHANGE_MONEY_AMOUNT, money_type, amount};
}

// explisitly set layer?
export function dress_clothes(item) {
  return {type: DRESS_CLOTHES, item};
}

export function inventory_add_item(item) {
  return {type: INVENTORY_ADD_ITEM, item};
}

export function inventory_remove_item(item) {
  return {type: INVENTORY_REMOVE_ITEM, item};
}

export function change_global_flag(flag) {
  return {type: CHANGE_GLOBAL_FLAG, flag};
}
