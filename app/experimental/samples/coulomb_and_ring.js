// @flow
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import random from 'random'
import seedrandom from 'seedrandom'
import * as Color from 'common/color'
import * as U from 'common/utils'
import { addCircleMask } from 'experimental/drawing_functions'
import { initDrawer } from 'experimental/drawer'

import type { DrawerState, DrawerOnTickCallback, DrawerDebugInfoUnit } from 'experimental/drawer'
import type { XYPoint } from 'common/utils'

// TODO reduce all copy-paste from gravity

type Vector = XYPoint

type Point = {
  id: number,
  x: number,
  y: number,
  mass: number, // or charge
  speed: Vector,
  // acc: Vector,
}

type State = {|
  ...DrawerState,
  step: number,
  points: Array<Point>,
|}

const FORCE_STRENGTH = 0.05
const COUNT_POINTS = 30

const initGraphics = (oldState: DrawerState): State => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.step = 0
  state.points = R.map(id => {
    const { x, y } = U.randomPointInSquare(state.size / 2)
    return { id, x: x - state.size / 4, y: y - state.size / 4, mass: 1, speed: { x: 0, y: 0 } }
  })(R.range(0, COUNT_POINTS))
  return state
}

const redraw = (oldState: State): State => {
  const state = { ...oldState }
  state.step += 1
  if (state.step > 100) {
    // return state
  }
  state.points = calcForceAcceleration(state.points)
  state.points = calcCircleBorderForceAcceleration(state.points, state.size / 2)
  state.points = state.points.map(p => ({ ...p, x: p.x + p.speed.x, y: p.y + p.speed.y }))
  // naive circle border -- just return point back if they out of circle
  state.points = state.points.map(p => {
    const { angle, radius } = U.toPolarCoords(p)
    if (radius > state.size / 2) {
      const { x, y } = U.fromPolarCoords({ angle, radius: state.size / 2 })
      return { ...p, x, y }
    }
    return p
  })

  state.base_container.removeChildren()
  state.points.forEach(p => {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(Color.to_pixi([255, 255, 255]), 1)
    graphics.drawCircle(0, 0, 2 * p.mass)
    graphics.endFill()
    graphics.x = p.x
    graphics.y = p.y
    state.base_container.addChild(graphics)
  })
  addCircleMask(state.base_container, state.size / 2)
  return state
}

const calcForceAcceleration = (points: Array<Point>): Array<Point> => R.map(p => {
  const accelerationSum = R.reduce((accSpeed, p2) => {
    if (p === p2) {
      return accSpeed
    }
    const acceleration = -FORCE_STRENGTH * p2.mass / (U.distance(p, p2) ** 2)
    const accVector = { x: acceleration * (p2.x - p.x), y: acceleration * (p2.y - p.y) }
    return crossSumm(accSpeed, accVector)
  }, { x: 0, y: 0 }, points)
  return { ...p, speed: crossSumm(p.speed, accelerationSum) }
})(points)

const calcCircleBorderForceAcceleration = (points: Array<Point>, circleRadius: number): Array<Point> => R.map(p => {
  const { angle, radius } = U.toPolarCoords({ x: p.x, y: p.y })
  const distToBorder = circleRadius - radius
  if (distToBorder < 0) {
    // console.log('POINT IS OUT OF BORDER', p)
  }
  // const radiusVector = 0.5 * 1 / (distToBorder ** 3)
  const radiusVector = 0.5 * 1 / Math.exp(distToBorder - circleRadius / 20)
  const accVector = U.fromPolarCoords({ angle: angle + Math.PI, radius: radiusVector })
  return { ...p, speed: crossSumm(p.speed, accVector) }
})(points)

const crossSumm = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })

const updateDebugInfo = (state: State): Array<DrawerDebugInfoUnit> => [
  { text: 'tick', value: state.tick },
]

export const init = (drawerOnTickCallback: DrawerOnTickCallback) => initDrawer(
  'circle',
  updateDebugInfo,
  initGraphics,
  redraw,
  drawerOnTickCallback,
)
