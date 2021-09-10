// @flow
import { initTableauDrawer } from 'experimental/tableau_drawer'

import type { TableauCell } from 'experimental/tableau_drawer'
import type { InitDrawerResult } from 'experimental/drawer'

const initElementState = (element: TableauCell): TableauCell => ({ ...element, color: Math.random() })

// this func suppose to change new_color prop, not color!
const mutateElementState = (element: TableauCell, state): TableauCell => {
  return { ...element, new_color: (element.color + (state.color_change_per_tick / 256)) % 1 }
}

export const initRandomTableau = (): InitDrawerResult => initTableauDrawer(initElementState, mutateElementState)
