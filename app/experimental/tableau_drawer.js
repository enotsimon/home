// @flow
import Util from 'common/util'
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'
import { initDrawer } from 'experimental/drawer'

import type { DrawerState } from 'experimental/drawer'

export type TableauCell = {|
  x: number,
  y: number,
  color: number,
  new_color: number,
  graphics: Object, // PIXI
|}
export type TableauData = Array<Array<TableauCell>>
export type TableauState = {|
  ...DrawerState,
  x_size: number,
  y_size: number,
  color_change_per_tick: number,
  data: TableauData,
  throttle: number,
  cyclesLimit: number,
|}
export type TableauElementMutator = (TableauCell, TableauState) => TableauCell

export const getElementColor = (x: number, y: number, state: TableauState, outOfBorderFunc: () => number): number => {
  return state.data[y] && state.data[y][x] ? state.data[y][x].color : outOfBorderFunc()
}

export const initTableauDrawer = (
  initElementState: TableauElementMutator,
  mutateElementState: TableauElementMutator,
  throttle: number = 1,
  cyclesLimit: number = 0,
  x_size: number = 100,
  y_size: number = 100,
): void => initDrawer(
  'square',
  () => [], // ???
  state => initGraphics(state, initElementState, throttle, cyclesLimit, x_size, y_size),
  state => redraw(state, mutateElementState, initElementState),
)


const initGraphics = (oldState, initElementState, throttle, cyclesLimit, x_size, y_size): TableauState => {
  let state: TableauState = { ...oldState }
  state.throttle = throttle
  state.cyclesLimit = cyclesLimit
  state.x_size = x_size
  state.y_size = y_size
  state.color_change_per_tick = 8
  state.data = []
  const square_size = Math.min(state.size / state.x_size, state.size / state.y_size)
  for (let y = 0; y < state.y_size; y += 1) {
    state.data[y] = []
    for (let x = 0; x < state.x_size; x += 1) {
      const graphics = new PIXI.Graphics()
      graphics.beginFill(Color.to_pixi([255, 255, 255]))
      graphics.drawRect(
        Util.normalize_value(x, state.x_size, state.size),
        Util.normalize_value(y, state.y_size, state.size),
        square_size,
        square_size
      )
      graphics.endFill()
      state.base_container.addChild(graphics)
      state.data[y][x] = { x, y, color: 0, new_color: 0, graphics }
    }
  }
  state = initState(state, initElementState)
  state = updateCells(state)
  return state
}

const redraw = (oldState: TableauState, mutateElementState, initElementState): TableauState => {
  let state = { ...oldState }
  state = mutateState(state, mutateElementState, initElementState)
  state = updateCells(state)
  return state
}

const updateCells = (state) => forAllElements(element => {
  /* eslint-disable-next-line no-param-reassign */
  element.graphics.alpha = element.color
  return element
}, state)

const forAllElements = (func: Function, state: TableauState): TableauState => {
  const newData = state.data.map(line => line.map(element => func(element)))
  return { ...state, data: newData }
}

const initState = (state: TableauState, initElementState): TableauState => {
  return forAllElements(element => initElementState(element, state), state)
}

const mutateState = (oldState: TableauState, mutateElementState, initElementState): TableauState => {
  let state: TableauState = { ...oldState }
  // reinit all tableau after life cycle expired
  if (state.cyclesLimit && (state.ticks % (state.cyclesLimit * state.throttle) === 1)) {
    return initState(state, initElementState)
  }
  // throttle to lower speed
  if (state.ticks % state.throttle !== 0) {
    return state
  }
  state = forAllElements(element => mutateElementState(element, state), state)
  state = forAllElements(element => {
    /* eslint-disable-next-line no-param-reassign */
    element.color = element.new_color
    return element
  }, state)
  return state
}
