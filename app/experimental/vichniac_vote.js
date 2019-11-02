// @flow
import { createTableauDrawer, getElementColor } from 'experimental/tableau_drawer'

const outOfBorderFunc = () => 1

const initElementState = (element) => ({ ...element, color: Math.random() > 0.5 ? 1 : 0 })

/*
const mutate_state = () => {
  const step = 15
  // throttle to lower speed
  if (this.ticks % step == 1) {
    super.mutate_state()
  }
  // TODO -- move this functiononality to tableaudrawer
  if (this.ticks % (30 * step) == 1) {
    this.init_state()
  }
}
*/

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

createTableauDrawer(
  initElementState,
  mutateElementState,
  15,
  200,
  200,
)
