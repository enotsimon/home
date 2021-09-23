// @flow
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import * as U from 'common/utils'
import random from 'random'
import seedrandom from 'seedrandom'
import { addCircleMask } from 'experimental/drawing_functions'
import { calcCircleBorderForceAcceleration, returnPointsToCircle } from 'experimental/circle_border'
import { randomPointPolar } from 'experimental/random_points'

import { startDrawer } from 'experimental/drawer'
import type { DrawerState } from 'experimental/drawer'
import type { MassSpeedPoint } from 'experimental/circle_border'

type Point = {|
  ...MassSpeedPoint,
  id: number,
|}

type State = {|
  ...DrawerState,
  step: number,
  points: Array<Point>,
|}

const COUNT_POINTS = 50
const MULTIPLIER = 200
const GRAVITY_STRENGTH = 0.00005 * MULTIPLIER

const initGraphics = (oldState: DrawerState): State => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.step = 0
  // state.points = threePoints(state.size / 2)
  // - state.size / 5 thats cause of circle border force
  state.points = bunchOfSpinningPoints(state.size / 2 - state.size / 5, COUNT_POINTS)
  return state
}

/* eslint-disable-next-line no-unused-vars */
const threePoints = (maxRadius: number): Array<Point> => [{
  id: 1,
  x: 0,
  y: -3 * maxRadius / 4,
  mass: 1,
  speed: { x: 0, y: 0 },
}, {
  id: 2,
  x: 0,
  y: 0,
  mass: 2,
  speed: { x: 0, y: 0 },
}, {
  id: 3,
  x: -maxRadius / 10,
  y: 3 * maxRadius / 4,
  mass: 3,
  speed: { x: 0, y: 0 },
}]

const bunchOfSpinningPoints = (maxRadius: number, count: number): Array<Point> => R.map(id => {
  const polarPoint = randomPointPolar(maxRadius)
  const speedVectorAngle = polarPoint.angle - Math.PI / 4 // perpendicular to right
  return {
    ...U.fromPolarCoords(polarPoint),
    id,
    mass: 1,
    speed: U.fromPolarCoords({ angle: speedVectorAngle, radius: maxRadius / MULTIPLIER })
  }
})(R.range(1, count + 1))


const redraw = (oldState: State): State => {
  const state = { ...oldState }
  state.step += 1
  if (state.step > 100) {
    // return state
  }
  state.points = calcGravityAcceleration(state.points)
  // $FlowIgnore TODO
  state.points = calcCircleBorderForceAcceleration(state.points, state.size / 2, state.size / 5)
  // $FlowIgnore
  state.points = state.points.map(p => ({ ...p, x: p.x + p.speed.x, y: p.y + p.speed.y }))
  state.points = returnPointsToCircle(state.points, state.size / 2)

  state.base_container.removeChildren()
  state.points.forEach(p => {
    // console.log('PIONT', p)
    const graphics = new PIXI.Graphics()
    graphics.beginFill(Color.to_pixi([255, 255, 255]), 1)
    graphics.drawCircle(0, 0, p.mass ** 0.5)
    graphics.endFill()
    graphics.x = p.x
    graphics.y = p.y
    state.base_container.addChild(graphics)
  })
  addCircleMask(state.base_container, state.size / 2)
  return state
}

const calcGravityAcceleration = (points: Array<Point>): Array<Point> => R.map(p => {
  const accelerationSum = R.reduce((accSpeed, p2) => {
    if (p === p2) {
      return accSpeed
    }
    const acceleration = GRAVITY_STRENGTH * p2.mass / (U.distance(p, p2) ** 2)
    const accVector = { x: acceleration * (p2.x - p.x), y: acceleration * (p2.y - p.y) }
    return crossSumm(accSpeed, accVector)
  }, { x: 0, y: 0 }, points)
  if (p.id === 2) {
    // console.log('acc sum', accelerationSum)
  }
  return { ...p, speed: crossSumm(p.speed, accelerationSum) }
})(points)

// const crossProduct = (a, b) => ({ x: a.x * b.y, y: b.x * a.y })
// const crossProduct = (a, b) => ({ x: a.x * b.y, y: -b.x * a.y }) OR?

const crossSumm = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })

export const init = (): void => startDrawer('circle', initGraphics, redraw)
