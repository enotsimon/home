import { combineReducers } from 'redux'
import * as actions from './actions'

let defaults = {
  // DONT WORK!
  //scenes: require('monster/config/scenes').default, // TEMP
}

const scenes = {
  [actions.modify_scene.name]: (state, action) => ({...state, [action.scene.id]: scene}),
}

const create_reducer = (default_state, handlers) => {
  return (state = default_state, action) => {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else if (handlers.hasOwnProperty('default')) {
      return handlers.default(state, action)
    } else {
      return state
    }
  }
}

const root_reducer = combineReducers({
  scenes: create_reducer(defaults.scenes, scenes),
});

export default root_reducer
