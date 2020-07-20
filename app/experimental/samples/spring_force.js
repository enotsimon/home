// @flow
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import random from 'random'
import seedrandom from 'seedrandom'
import * as Color from 'common/color'
import * as U from 'common/utils'
import { addCircleMask } from 'experimental/drawing_functions'
import { initDrawer } from 'experimental/drawer'
import { randomPointPolar } from 'experimental/random_points'

import type { DrawerState, DrawerOnTickCallback } from 'experimental/drawer'
import type { XYPoint } from 'common/utils'

// type Vector = XYPoint
type Point = {|
  ...XYPoint,
  id: number,
  // its not a mass but kind a spring force weight
  mass: number,
|}

type State = {|
  ...DrawerState,
  points: Array<Point>,
|}

// const FORCE_STRENGTH = 0.05
const COUNT_POINTS = 20

const initGraphics = (oldState: DrawerState): State => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.step = 0
  state.points = R.map(id => {
    const { x, y } = U.fromPolarCoords(randomPointPolar(state.size / 2))
    return { id, x, y, mass: random.int(1, 1) }
  })(R.range(0, COUNT_POINTS))
  // state.points = [
  //   { id: 1, mass: 1, x: 0, y: 0 },
  //   { id: 2, mass: 1, x: 20, y: 0 },
  //   { id: 3, mass: 1, x: -20, y: 0.01 },
  // ]
  return state
}

const redraw = (oldState: State): State => {
  const state = { ...oldState }
  state.points = calcForceMovement(state, state.points, state.size / 2)
  // state.points = calcCircleBorderForceAcceleration(state.points, state.size / 2)
  // state.points = state.points.map(p => ({ ...p, x: p.x + p.speed.x, y: p.y + p.speed.y }))
  // naive circle border -- just return point back if they out of circle
  state.points = state.points.map(p => {
    const { angle, radius } = U.toPolarCoords(p)
    if (radius > state.size / 2) {
      // console.log('OUT OF BORDER', p)
      const { x, y } = U.fromPolarCoords({ angle, radius: state.size / 2 })
      return { ...p, x, y }
    }
    return p
  })

  state.base_container.removeChildren()
  state.points.forEach(p => {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(Color.to_pixi([255, 255, 255]), 1)
    graphics.drawCircle(0, 0, 1.5 * p.mass)
    graphics.endFill()
    graphics.x = p.x
    graphics.y = p.y
    state.base_container.addChild(graphics)
  })
  addCircleMask(state.base_container, state.size / 2)
  return state
}

const calcForceMovement = (state, points: Array<Point>, circleRadius: number): Array<Point> => R.map(p => {
  // const FORCE_STRENGTH = 0.0001 // funny -- they stick togehter
  // const MOVE_MAX = 0.01
  const FORCE_STRENGTH = -0.001
  const FORCE_POW = 2
  const FORCE_MAX_DISTANCE_MUL = 2
  const MOVE_MAX = 0.001
  const springForceVector = R.reduce((vector, p2) => {
    if (p === p2) {
      return vector
    }
    const distance = U.distance(p, p2)
    const zeroDistance = forceZeroDistance(p.mass + p2.mass, circleRadius)
    // TODO -- division alwais stronger than sticking?
    let toMove = FORCE_STRENGTH * ((distance - zeroDistance) ** FORCE_POW)
    // its like Worlds The Very Movement Speed Limit, ie speed of light )))))
    toMove = R.pipe(R.min(MOVE_MAX), R.max(-MOVE_MAX))(toMove)
    // its like spring has broked and works no more
    toMove = distance > (FORCE_MAX_DISTANCE_MUL * zeroDistance) ? 0 : toMove
    // if (state.ticks % 10 === 0) {
    //   console.log(toMove, zeroDistance, distance)
    // }
    const newVector = { x: toMove * (p2.x - p.x), y: toMove * (p2.y - p.y) }
    return crossSumm(vector, newVector)
  }, { x: 0, y: 0 }, points)
  const { x, y } = crossSumm(p, springForceVector)
  return { ...p, x, y }
})(points)

const forceZeroDistance = (massFactor: number, circleRadius: number): number => circleRadius * massFactor / 10

/*
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
*/
const crossSumm = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })

export const init = (drawerOnTickCallback: DrawerOnTickCallback) => initDrawer(
  'circle',
  () => [],
  initGraphics,
  redraw,
  drawerOnTickCallback,
)
