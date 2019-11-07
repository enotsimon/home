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

type Dot = {
  angle: number,
  radius: number,
  parent: ?Dot,
  children: Array<Dot>,
}

const initGraphics = (oldState: DrawerState): DotsState => {
  const state = { ...oldState }
  const totalDots = 100
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.dots = R.range(1, totalDots).map(() => ({
    angle: random.float(0, 2 * Math.PI),
    radius: random.float(),
    parent: null,
    children: [],
  }))
  // Color.to_pixi([255, 255, 255])
  state.dotsGraphics = state.dots.map(dot => {
    const { x, y } = Util.from_polar_coords(dot.angle, dot.radius)
    const graphics = new PIXI.Graphics()
    graphics.beginFill(Color.to_pixi([255, 255, 255]), 1)
    graphics.drawCircle(0, 0, 1)
    graphics.endFill()
    graphics.x = state.size / 2 * x
    graphics.y = state.size / 2 * y
    state.base_container.addChild(graphics)
    return graphics
  })

  return state
}

const redraw = (state: DrawerState): DrawerState => {
  return state
}

export const initDotsSpiral = () => initDrawer(
  'circle',
  () => [],
  initGraphics,
  redraw,
)
