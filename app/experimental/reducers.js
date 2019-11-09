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
  mousePos: { x: number, y: number },
}

const defaultState = {
  fps: 0,
  mousePos: { x: 0, y: 0 },
}

export const reducers = createReducerFromMap(defaultState, {
  actionTick: (state, { fps }) => ({ ...state, fps }),
  actionMouseMove: (state, { event }) => ({ ...state, mousePos: { x: event.offsetX, y: event.offsetY } }),
})
