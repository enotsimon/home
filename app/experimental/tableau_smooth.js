// @flow
import { createTableauDrawer } from 'experimental/tableau_drawer'

import type { TableauCell } from 'experimental/tableau_drawer'

type SmoothTableauCell = TableauCell & {
  sign: number,
}

const initElementState = (element: TableauCell): SmoothTableauCell => ({ ...element, color: Math.random(), sign: 1 })

// this func suppose to change new_color prop, not color!
const mutateElementState = (e: SmoothTableauCell, state): SmoothTableauCell => {
  const element: SmoothTableauCell = { ...e }
  if (element.color <= 0) {
    element.sign = 1
  } else if (element.color >= 1) {
    element.sign = -1
  }
  element.new_color = (element.color + element.sign * (state.color_change_per_tick / 256))
  // they can be slightly less or greater this because of float calc errors or maybe some my error
  element.new_color = Math.max(0, element.new_color)
  element.new_color = Math.min(1, element.new_color)
  return element
}

// i dunno how to teach flow that initElementState returns SmoothTableauCell
// and so mutateElementState will take SmoothTableauCell, not TableauCell
// $FlowIgnore
createTableauDrawer(initElementState, mutateElementState)
