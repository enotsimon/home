// @flow
import Util from 'common/util'
import Color from 'common/color'
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import random from 'random'
import seedrandom from 'seedrandom'

import { initDrawer } from 'experimental/drawer'
import type { DrawerState } from 'experimental/drawer'

type DotsState = DrawerState & {
  dots: Array<Dot>,
  // note they are separated from 'buisness' objects
  dotsGraphics: Array<Object>, // PIXI graphics
}

type DotId = number
type Dot = {
  id: DotId,
  angle: number,
  radius: number,
  // store them cause too ofter we need to convert from polar
  x: number,
  y: number,
  parent: ?DotId,
  children: Array<DotId>,
}

const initGraphics = (oldState: DrawerState): DotsState => {
  const state = { ...oldState }
  const totalDots = 100
  const seed = Date.now()
  random.use(seedrandom(seed))
  // TODO min distance between
  state.dots = recursiveAddDots(state.size / 2, totalDots)
  // Color.to_pixi([255, 255, 255])
  state.dotsGraphics = state.dots.map(dot => {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(Color.to_pixi([255, 255, 255]), 1)
    graphics.drawCircle(0, 0, 1)
    graphics.endFill()
    graphics.x = dot.x
    graphics.y = dot.y
    state.base_container.addChild(graphics)
    return graphics
  })

  return state
}

const redraw = (state: DrawerState): DrawerState => {
  return state
}

const recursiveAddDots = (scale: number, limit: number, dots = [], cycles: number = 0) => {
  const theVeryDistanceLimit = 0.02 * scale
  if (limit === 0) {
    return dots
  }
  if (cycles === 1000) {
    throw new Error('too many cycles')
  }
  // FIXME не равномерное распределение!
  const angle = random.float(0, 2 * Math.PI)
  const radius = scale * random.float()
  const { x, y } = Util.from_polar_coords(angle, radius)
  const tooClose = R.find(d => Util.distance(d, { x, y }) <= theVeryDistanceLimit)(dots)
  if (tooClose) {
    return recursiveAddDots(scale, limit, dots, cycles + 1)
  }
  const dot = { angle, radius, x, y, parent: null, children: [] }
  console.log('i add', dot)
  return recursiveAddDots(scale, limit - 1, [...dots, dot], 0)
}

export const initDotsSpiral = () => initDrawer(
  'circle',
  () => [],
  initGraphics,
  redraw,
)
