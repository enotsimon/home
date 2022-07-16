// @flow
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import * as U from 'enot-simon-utils/lib/utils'
import random from 'random'
import seedrandom from 'seedrandom'

import { startDrawer } from 'experimental/drawer'
import { addDotsIntoCircleWithMinDistance } from 'experimental/random_points'
import type { DrawerState } from 'experimental/drawer'

type DotsState = {|
  ...DrawerState,
  dots: Array<Dot>,
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
  parent: ?DotId,
  children: Array<DotId>,
}

const DISTANCE_LIMIT_MUL = 0.02

const initGraphics = (oldState: DrawerState): DotsState => {
  const state = { ...oldState }
  const totalDots = 250
  const seed = Date.now()
  random.use(seedrandom(seed))
  // TODO min distance between
  const dotsObj = addDotsIntoCircleWithMinDistance(state.size / 2, DISTANCE_LIMIT_MUL * state.size, totalDots)
  state.dots = R.map(d => ({ ...d, parent: null, children: [] }))(R.values(dotsObj))
  state.dots = connectDotsToSpiral(state.dots)
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
  // TODO add this crap to state
  drawLines(state.dots, state.base_container)

  return state
}

const redraw = (state: DotsState): DotsState => {
  return state
}

const connectDotsToSpiral = (dots: Array<Dot>): Array<Dot> => {
  if (R.length(dots) === 0) {
    return dots
  }
  // just to be sure
  R.forEach(d => {
    if (d.parent || R.length(d.children) !== 0) {
      throw new Error('call connectDotsToSpiral() on non-blank dots list')
    }
  })(dots)
  const mostDistantDot = R.sort((d1, d2) => d2.radius - d1.radius)(dots)[0]
  return connectDotsToSpiralRecursive(mostDistantDot, dots)
}

const connectDotsToSpiralRecursive = (curDot: Dot, origDots: Array<Dot>, cycles = 0): Array<Dot> => {
  if (cycles > origDots.length) {
    throw new Error('eternal cycle!')
  }
  let dots = [...origDots]
  const openList = R.filter(d => d.id !== curDot.id && R.length(d.children) === 0)(dots)
  if (R.length(openList) === 0) {
    return dots
  }
  // FIXME the very problem is that i dont understand why we need ssytem center
  // i thought we can take any quite distant point for it, but -- it works incorrect
  const anyDamnPoint = { x: 0, y: 0 }
  const openListWithAngles = openList.map(d => ({ ...d, diffAngle: U.angleBy3Points(anyDamnPoint, curDot, d) }))
  const sortedByAngle = R.sort((d1, d2) => d2.diffAngle - d1.diffAngle)(openListWithAngles)
  const nextDot = sortedByAngle[0]
  const newNextDot = { ...nextDot, parent: curDot.id }
  const newCurDot = { ...curDot, children: [nextDot.id] }
  // fuck!
  dots = dots.map(d => {
    if (d.id === newCurDot.id) {
      return newCurDot
    }
    if (d.id === newNextDot.id) {
      return newNextDot
    }
    return d
  })
  return connectDotsToSpiralRecursive(newNextDot, dots, cycles + 1)
}

const drawLines = (dots: Array<Dot>, container: Object): void => {
  dots.forEach(dot => {
    if (R.length(dot.children) === 0) {
      return
    }
    dot.children.forEach(idTo => {
      const target = R.find(d => d.id === idTo)(dots)
      if (!target) {
        throw new Error('crap is no the way, i cant find dot by id')
      }
      const graphics = new PIXI.Graphics()
      graphics.lineStyle(1, Color.to_pixi([255, 255, 255]))
      graphics.moveTo(dot.x, dot.y)
      graphics.lineTo(target.x, target.y)
      container.addChild(graphics)
    })
  })
}

export const initDotsSpiral = (): void => startDrawer('circle', initGraphics, redraw)
