// @flow
// import { combineReducers } from 'redux'

// copy-paste from monster
// ------------------------
type Action = { type: string, [string]: any }
type ReducerMapCallback = (state: State, action: Action) => State
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

type State = {
  fps: number,
}

export const reducers = createReducerFromMap({}, {
  actionTick: (state, { fps }) => {
    // throw new Error('dsacds')
    return { ...state, fps }
  },
})
