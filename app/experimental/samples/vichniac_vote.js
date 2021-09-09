// @flow
import { initTableauDrawer, getElementColor } from 'experimental/tableau_drawer'

import type { InitDrawerResult } from 'experimental/drawer'

const outOfBorderFunc = () => 1

const initElementState = (element) => ({ ...element, color: Math.random() > 0.5 ? 1 : 0 })

// this func suppose to change new_color prop, not color!
const mutateElementState = (element, state) => {
  const { x, y } = element
  const e1 = getElementColor(x - 1, y - 1, state, outOfBorderFunc)
  const e2 = getElementColor(x + 0, y - 1, state, outOfBorderFunc)
  const e3 = getElementColor(x + 1, y - 1, state, outOfBorderFunc)
  const e4 = getElementColor(x - 1, y + 0, state, outOfBorderFunc)
  const e5 = getElementColor(x + 0, y + 0, state, outOfBorderFunc)
  const e6 = getElementColor(x + 1, y + 0, state, outOfBorderFunc)
  const e7 = getElementColor(x - 1, y + 1, state, outOfBorderFunc)
  const e8 = getElementColor(x + 0, y + 1, state, outOfBorderFunc)
  const e9 = getElementColor(x + 1, y + 1, state, outOfBorderFunc)
  return { ...element, new_color: e1 + e2 + e3 + e4 + e5 + e6 + e7 + e8 + e9 > 4 ? 1 : 0 }
}

export const initVichniacVote = (): InitDrawerResult => initTableauDrawer(
  initElementState,
  mutateElementState,
  15,
  20,
  200,
  200,
)
