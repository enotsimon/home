// @flow
// import random from 'random'

import { initTableauDrawer } from 'experimental/tableau_drawer'

import type { TableauState, TableauCell } from '../tableau_drawer'

/* eslint-disable quote-props */

const SIZE = 100

const randSartValue = (x, y) => {
  // if (x === 0 || y === 0 || x === SIZE - 1 || y === SIZE - 1) {
  //   return 2
  // }
  const pattern = `${x}_${y}`
  const map = {
    '50_50': 2,
    // '51_50': 2,
    // '50_51': 2,
    '51_51': 2,
  }
  if (map[pattern]) {
    return map[pattern]
  }
  // return (random.float() < 0.1 ? 1 : 0)
  return 0
}

const rule = (v00, v10, v01, v11) => {
  const pattern = `${v00}${v10}${v01}${v11}`
  const map = {
    // '1100': 2,
    // '1010': 2,
    '1001': 2,

    '2200': 1,
    '2020': 1,
    // '2002': 1,

    '0200': 2,
    '0020': 2,
    '0002': 2,

    '2222': 0,
    '0222': 0,
    '2022': 0,
    '2202': 0,
    '2220': 0,
  }
  const current = map[pattern]
  if (current !== undefined) {
    return current
  }
  const currentValueMap = {
    na: 0,
    '1': 0,
    '2': 2,
  }
  return currentValueMap[v00] || 0
}

const getElementValue = (x, y, state) => (state.data[y] && state.data[y][x] ? state.data[y][x].value : 'na')

const valueToColor = value => {
  const map = {
    '1': 0.5,
    '2': 1,
  }
  return map[value] || 0
}

const initElementState = (element: TableauCell): TableauCell =>
  ({ ...element, value: randSartValue(element.x, element.y), new_value: 0 })

// this func suppose to change new_color prop, not color!
const mutateElementState = (element: TableauCell, state: TableauState): TableauCell => {
  const { x, y } = element
  const v00 = getElementValue(x + 0, y + 0, state)
  const v10 = getElementValue(x + 1, y + 0, state)
  const v01 = getElementValue(x + 0, y + 1, state)
  const v11 = getElementValue(x + 1, y + 1, state)
  const newValue = rule(v00, v10, v01, v11)
  return { ...element, new_color: valueToColor(newValue), new_value: newValue }
}

export const init = (): void => initTableauDrawer(
  initElementState,
  mutateElementState,
  5,
  0,
  SIZE,
  SIZE,
)
