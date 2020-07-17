// @flow
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import * as U from 'common/utils'
import random from 'random'
import seedrandom from 'seedrandom'

import { initDrawer } from 'experimental/drawer'
import type { DrawerState, DrawerOnTickCallback } from 'experimental/drawer'

type DotsState = {|
  ...DrawerState,
  dots: Dots,
  links: Array<Link>,
  // note they are separated from 'buisness' objects
  dotsGraphics: Array<Object>, // PIXI graphics
|}

type DotId = number
type Dot = {
  id: DotId,
  angle: number,
  radius: number,
  // store them cause too ofter we need to convert from polar
  x: number,
  y: number,
}
type Dots = {[DotId]: Dot}
type Link = [DotId, DotId]

const initGraphics = (oldState: DrawerState): DotsState => {
  const state = { ...oldState }
  const totalDots = 250
  const seed = Date.now()
  random.use(seedrandom(seed))
  // TODO min distance between
  state.dots = recursiveAddDots(state.size / 2, totalDots)
  state.links = connectDots(state.dots)
  state.dotsGraphics = drawDots(state.dots, state.base_container)
  // TODO add this crap to state
  drawLines(state.dots, state.links, state.base_container)

  return state
}

const redraw = (state: DotsState): DotsState => {
  return state
}

// TODO move it to utils like random-points-generator
const recursiveAddDots = (scale: number, limit: number, dots = {}, cycles: number = 0): Dots => {
  const theVeryDistanceLimit = 0.02 * scale
  if (limit === 0) {
    return dots
  }
  if (cycles === 1000) {
    throw new Error('too many cycles')
  }
  // TODO stupid way, but -- dont care
  const x = random.int(-scale, scale)
  const y = random.int(-scale, scale)
  const { angle, radius } = U.toPolarCoords({ x, y })
  // theVeryDistanceLimit i added because of circle contour
  if (radius > (scale - theVeryDistanceLimit)) {
    return recursiveAddDots(scale, limit, dots, cycles)
  }
  const tooClose = R.find(d => U.distance(d, { x, y }) <= theVeryDistanceLimit)(dots)
  if (tooClose) {
    return recursiveAddDots(scale, limit, dots, cycles + 1)
  }
  const dot = { id: limit, angle, radius, x, y }
  return recursiveAddDots(scale, limit - 1, { ...dots, [limit]: dot }, 0)
}

/* eslint-disable-next-line no-unused-vars */
const connectDots = (dots: Dots): Array<Link> => {
  return []
}

/* eslint-disable-next-line no-unused-vars */
const drawLines = (dots: Array<Dot>, links: Array<Link>, container: Object): void => {
}

const drawDots = (dots: Array<Dot>, container: Object): Array<Object> => {
  return R.map(dot => {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(Color.to_pixi([255, 255, 255]), 1)
    graphics.drawCircle(0, 0, 1)
    graphics.endFill()
    graphics.x = dot.x
    graphics.y = dot.y
    container.addChild(graphics)
    return graphics
  })(dots)
}

export const init = (drawerOnTickCallback: DrawerOnTickCallback) => initDrawer(
  'circle',
  () => [],
  initGraphics,
  redraw,
  drawerOnTickCallback,
)
