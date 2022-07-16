// @flow
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import random from 'random'
import seedrandom from 'seedrandom'
import * as Color from 'enot-simon-utils/lib/color'
import * as U from 'enot-simon-utils/lib/utils'
import { addCircleMask } from 'experimental/drawing_functions'
import { startDrawer } from 'experimental/drawer'
import { calcCircleBorderForceAcceleration, returnPointsToCircle } from 'experimental/circle_border'
import { randomPointInSquare } from 'experimental/random_points'

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

const FORCE_STRENGTH = 0.01
const COUNT_POINTS = 30

const initGraphics = (oldState: DrawerState): State => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.step = 0
  state.points = R.map(id => {
    const { x, y } = randomPointInSquare(state.size / 2)
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
  // $FlowIgnore
  state.points = calcCircleBorderForceAcceleration(state.points, state.size / 2, state.size / 5)
  // $FlowIgnore
  state.points = state.points.map(p => ({ ...p, x: p.x + p.speed.x, y: p.y + p.speed.y }))
  state.points = returnPointsToCircle(state.points, state.size / 2)

  redrawGraphics(state)

  return state
}

// side effects
const redrawGraphics = state => {
  state.base_container.removeChildren()
  state.points.forEach(p => {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(Color.to_pixi([255, 255, 255]), 1)
    graphics.drawCircle(0, 0, p.mass ** 0.5)
    graphics.endFill()
    graphics.x = p.x
    graphics.y = p.y
    state.base_container.addChild(graphics)
  })
  addCircleMask(state.base_container, state.size / 2)
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

const crossSumm = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })

export const init = (): void => startDrawer('circle', initGraphics, redraw)
