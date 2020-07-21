// @flow
import Util from 'common/util'
import { initTableauDrawer, getElementColor } from 'experimental/tableau_drawer'

/**
 * https://en.wikipedia.org/wiki/Rule_30
 */


// color = (element.y == this.y_size - 1) && (element.x == this.x_size / 2 | 0) ? 1 : 0;
const initElementState = (element) => ({ ...element, color: 0 })

// this func suppose to change new_color prop, not color!
const mutateElementState = (element, state) => {
  let color = 0
  if (element.y === state.y_size - 1) {
    const l = getElementColor(element.x - 1, element.y, state, outOfBorderFunc)
    const r = getElementColor(element.x + 1, element.y, state, outOfBorderFunc)
    const s = element.color
    color = elementStateRule(l, r, s)
  } else {
    // just copy lower cell color
    color = state.data[element.y + 1][element.x].color
  }
  return { ...element, new_color: color }
}

/**
 *  this is the main BAD moment -- we got RANDOM color for cells out of border
 *  thats NOT CORRECT and so this all is not pure rule 30 evolution, but
 *  rule 30 with random initial state and random border conditions
 */
const outOfBorderFunc = () => Util.rand(0, 1)

// thats rule 30 itself
const elementStateRule = (l, r, s) => {
  // its a marasmus, but
  switch (`${l}${r}${s}`) {
    case '111':
    case '110':
    case '101':
      return 0
    case '100':
    case '011':
    case '010':
    case '001':
      return 1
    case '000':
      return 0
    default:
      throw ({ msg: 'unknown pattern', pattern: [l, r, s] })
  }
}

export const initRule30 = () => initTableauDrawer(initElementState, mutateElementState, 3)
