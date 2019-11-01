// @flow
import { createTableauDrawer } from 'experimental/tableau_drawer'

import type { TableauCell } from 'experimental/tableau_drawer'

const initElementState = (element: TableauCell): TableauCell => ({ ...element, color: Math.random() })

// this func suppose to change new_color prop, not color!
const mutateElementState = (element: TableauCell, color_change_per_tick: number): TableauCell => {
  return { ...element, new_color: (element.color + (color_change_per_tick / 256)) % 1 }
}

createTableauDrawer(initElementState, mutateElementState)
