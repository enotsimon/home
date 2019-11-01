// @flow
import { createTableauDrawer } from 'experimental/tableau_drawer'

import type { TableauCell } from 'experimental/tableau_drawer'

/* TODO -- use SmoothTableauCell for initElementState
type SmoothTableauCell = TableauCell & {
  sign: number,
}
*/

const initElementState = (element: TableauCell): TableauCell => ({ ...element, color: Math.random(), sign: 1 })

// this func suppose to change new_color prop, not color!
const mutateElementState = (e: TableauCell, color_change_per_tick: number): TableauCell => {
  const element = { ...e }
  if (element.color <= 0) {
    element.sign = 1
  } else if (element.color >= 1) {
    element.sign = -1
  }
  element.new_color = (element.color + element.sign * (color_change_per_tick / 256))
  // they can be slightly less or greater this because of float calc errors or maybe some my error
  element.new_color = Math.max(0, element.new_color)
  element.new_color = Math.min(1, element.new_color)
  return element
}

createTableauDrawer(initElementState, mutateElementState)
