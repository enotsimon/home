import { combineReducers } from 'redux';
import * as actions from './actions';


let defaults = {
  current_scene: "mage_room",
  money: {
    fishes: 0,
    foxes: 0,
  },
  clothes: {
    body: "dirty_dress",
  }
};


function current_scene(state = defaults.current_scene, action) {
  switch (action.type) {
    case actions.CHANGE_SCENE:
      console.log('action', actions.CHANGE_SCENE, action, state);
      return action.scene_name;
    default:
      return state;
  }
}


function money(state = defaults.money, action) {
  switch (action.type) {
    case actions.CHANGE_MONEY_AMOUNT:
      console.log('action', actions.CHANGE_MONEY_AMOUNT, action, state);
      if (action.money_type != 'fishes' && action.money_type != 'foxes') {
        throw({message: "bad money type", value: action.money_type});
      }
      let new_state = {...state};
      // @TODO add negative values chack
      new_state[action.money_type] += action.amount;
      return new_state;
    default:
      return state;
  }
}


/**
 *  @TODO what about sested actions -- like
 *  take off current clothes
 *  put it in inventory
 *  get given clothes from inventory
 *  put it on
 */
function clothes(state = defaults.clothes, action) {
  switch (action.type) {
    case actions.DRESS_CLOTHES:
      console.log('action', actions.DRESS_CLOTHES, action, state);
      // TOSO -- its just a draft
      if (!action.item.body_layer) {
        console.log('actions.DRESS_CLOTHES fail -- not a clothes', action.item);
        return state;
      }
      let new_state = {...state, body: action.item};
      
      return new_state;
    default:
      return state;
  }
}



const monster_app = combineReducers({
  current_scene,
  money,
  clothes,
});

export default monster_app;


