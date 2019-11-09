// @flow
import { combineReducers } from 'redux'

// copy-paste from monster
// ------------------------
type ReducerMapCallback = (state: any, action: any) => any
type ReducerMap = {
  [key: string]: ReducerMapCallback, // FIXME state: any
  default?: ReducerMapCallback,
}
const createReducerFromMap = (defaultState: any, handlers: ReducerMap) => {
  // FIXME state: any, action: any
  return (state: any = defaultState, action: any) => {
    if (handlers[action.type] !== undefined) {
      return handlers[action.type](state, action)
    } if (handlers.default) {
      return handlers.default(state, action)
    }
    return state
  }
}
// ------------------------

const tickHandlers = {
  // actionSetMap: () => 0,
  // actionTick: (tick: Tick) => tick + 1,
}

export const reducers = combineReducers({
  tick: createReducerFromMap({}, tickHandlers),
  debugIngo: createReducerFromMap({}, {}),
})
