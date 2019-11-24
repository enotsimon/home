// @flow
// import { combineReducers } from 'redux'
import type { DrawerDebugInfoUnit } from 'experimental/drawer'

// copy-paste from monster
// ------------------------
type Action = { type: string, [string]: any }
type ReducerMapCallback = (state: State, action: Action) => State
type ReducerMap = {
  [key: string]: ReducerMapCallback, // FIXME state: any
  default?: ReducerMapCallback,
}
const createReducerFromMap = (defaultState: State, handlers: ReducerMap) => {
  // FIXME state: any, action: any
  return (state: State = defaultState, action: Action) => {
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
  tickTime: number,
  tick_delta: number,
  debugInfo: Array<DrawerDebugInfoUnit>,
  mousePos: { x: number, y: number },
}

const defaultState = {
  fps: 0,
  tickTime: 0,
  tick_delta: 0,
  debugInfo: [],
  mousePos: { x: 0, y: 0 },
}

export const reducers = createReducerFromMap(defaultState, {
  actionTick: (state, { fps, delta, debugInfo }) => ({
    ...state,
    fps,
    tick_delta: delta,
    tickTime: state.tickTime + delta,
    debugInfo,
  }),
  actionMouseMove: (state, { event }) => ({
    ...state,
    mousePos: { x: event.offsetX, y: event.offsetY },
  }),
})
