// @flow
import Util from 'common/util'
import Color from 'common/color'
import * as PIXI from 'pixi.js'
import { createDrawer } from 'experimental/drawer'

import type { DrawerState } from 'experimental/drawer'

export type TableauCell = {
  x: number,
  y: number,
  color: number,
  new_color: number,
  graphics: Object, // PIXI
}
export type TableauData = Array<Array<TableauCell>>
export type TableauState = DrawerState & {
  x_size: number,
  y_size: number,
  color_change_per_tick: number,
  data: TableauData,
}
export type TableauElementMutator = (TableauCell, number) => TableauCell

export const createTableauDrawer = (
  initElementState: TableauElementMutator,
  mutateElementState: TableauElementMutator,
) => {
  createDrawer(
    'square',
    () => [], // ???
    state => initGraphics(state, initElementState),
    state => redraw(state, mutateElementState)
  )
}

const initGraphics = (oldState: DrawerState, initElementState): TableauState => {
  let state = { ...oldState }
  state.x_size = 100
  state.y_size = 100
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

const redraw = (oldState: TableauState, mutateElementState): TableauState => {
  let state = { ...oldState }
  state = mutateState(state, mutateElementState)
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
  return forAllElements(element => initElementState(element, state.color_change_per_tick), state)
}

const mutateState = (oldState: TableauState, mutateElementState): TableauState => {
  let state = { ...oldState }
  state = forAllElements(element => mutateElementState(element, state.color_change_per_tick), state)
  state = forAllElements(element => {
    /* eslint-disable-next-line no-param-reassign */
    element.color = element.new_color
    return element
  }, state)
  return state
}

/* dunno if its needed
const get_element_color = (x, y, out_of_border_func) => {
  return state.data[y] && state.data[y][x] ? state.data[y][x].color : out_of_border_func(x, y)
}
*/
