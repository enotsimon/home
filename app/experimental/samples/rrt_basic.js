// @flow
import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'
import * as Color from 'common/color'
import * as U from 'common/utils'
import { addCircleMask } from 'experimental/drawing_functions'
import { initDrawer } from 'experimental/drawer'

import type { DrawerState, DrawerOnTickCallback, DrawerDebugInfoUnit } from 'experimental/drawer'
import type { XYPoint } from 'common/utils'

type Point = {
  ...XYPoint,
  generation: number,
  index: number,
}
type State = {|
  ...DrawerState,
  points: Array<Point>,
  graphics: Object,
  zeroTick: number,
|}

const STEP = 5

const initGraphics = (state: DrawerState): State => {
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.base_container.removeChildren()
  const graphics = new PIXI.Graphics()
  state.base_container.addChild(graphics)
  addCircleMask(graphics, state.size / 2, { x: 0, y: 0 }, [100, 0, 0])
  return {
    ...state,
    zeroTick: 100 + state.ticks,
    points: [{ x: 0, y: state.size / 2, generation: 0, index: 0 }],
    graphics,
  }
}

const redraw = (oldState: State): State => {
  const state = { ...oldState }
  const { point, nearest } = getNewPoint(state.ticks - state.zeroTick, state.size / 2, state.points)
  if (!point || !nearest) {
    // const maxGeneration = R.reduce((ag, p) => Math.max(p.generation, ag), 0, state.points)
    // console.log('seems we cannot add any new point', 'maxGeneration', maxGeneration, 'tick', state.ticks)
    return initGraphics(state)
  }
  const pointColor = Math.max(50, 255 - (point.index / 3))
  const lineColor = Math.max(10, pointColor / 2)
  const lineWidth = Math.max(0.5, 2 - (point.index / 250))
  state.graphics.beginFill(Color.to_pixi([pointColor, 0, 0]), 1)
  state.graphics.drawCircle(point.x, point.y, 0.5)
  state.graphics.endFill()
  state.graphics.lineStyle(lineWidth, Color.to_pixi([lineColor, 0, 0]), 0.5)
  state.graphics.moveTo(nearest.x, nearest.y)
  state.graphics.lineTo(point.x, point.y)
  return { ...state, points: [...state.points, point] }
}

type Pair = { point: ?Point, nearest: ?Point }
const getNewPoint = (index: number, radius: number, points: Array<Point>, counter: number = 0): Pair => {
  if (counter > 1000) {
    return { point: null, nearest: null }
  }
  const newPointPolar = U.randomPointPolar(radius)
  const newPoint = U.fromPolarCoords(newPointPolar.angle, newPointPolar.radius)
  // $FlowIgnore
  const nearest = U.findNearestPoint(newPoint, points)
  if (U.distance(newPoint, nearest) < STEP) {
    return getNewPoint(index, radius, points, counter + 1)
  }
  const theta = Math.atan2(newPoint.y - nearest.y, newPoint.x - nearest.x)
  const pp = {
    x: nearest.x + STEP * Math.cos(theta),
    y: nearest.y + STEP * Math.sin(theta),
    // $FlowIgnore
    generation: nearest.generation + 1,
    index,
  }
  // $FlowIgnore
  return { point: pp, nearest }
}

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
