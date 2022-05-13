// @flow
/**
 * попробуем возродить идею карты из rrt
 * rrt это горные хребты
 */
import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'
import * as R from 'ramda'

import * as U from 'common/utils'
// import { addCircleMask } from 'experimental/drawing_functions'
import { drawRRTPoint, drawRRTLink } from 'experimental/drawing_functions'
import { startDrawer } from 'experimental/drawer'
import { generate, calcDepth } from 'common/rrt_diagram'
import { randomPointPolar } from 'experimental/random_points'

import type { DrawerState } from 'experimental/drawer'
import type { RRTWDDiagram } from 'common/rrt_diagram'
import type { RGBArray } from 'common/color'

const STEP = 5
const COLOR_MAX = [0, 255, 0]
const COLOR_MIN = [0, 25, 0]
const DEPTH_DRAW_THRESHOLD = 0
const REDRAW_STEP = 500

type State = {|
  ...DrawerState,
  rrt: RRTWDDiagram,
  pointsGraphics: Object,
  linksGraphics: Object,
|}

const initAll = (state: State): State => {
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.base_container.removeChildren()
  // order emulates z-index!
  // addCircleMask(state.base_container, state.size / 2, { x: 0, y: 0 }, COLOR_MIN)
  const linksGraphics = new PIXI.Graphics()
  state.base_container.addChild(linksGraphics)
  const pointsGraphics = new PIXI.Graphics()
  state.base_container.addChild(pointsGraphics)
  const root = { x: 0, y: 0 }
  // const root = randomPointFunc(state.size / 2)()
  const rrt = generate(STEP, randomPointFunc(state.size / 2), [root])
  console.log('cnt points', rrt.length)

  const rrtWithDepth = calcDepth(rrt)
  // console.log('RRT', rrtWithDepth)
  const newState = { ...state, rrt: rrtWithDepth, pointsGraphics, linksGraphics }
  drawRRT(newState)

  return newState
}

const randomPointFunc = (radius: number) => () => U.fromPolarCoords(randomPointPolar(radius))

const calcColor = (depth, depthMax): RGBArray => {
  // experimental
  if (depth < DEPTH_DRAW_THRESHOLD) {
    return [0, 0, 0]
  }
  // $FlowIgnore hes wrong
  return R.map(i => U.normalizeValue(depth, depthMax, COLOR_MAX[i], 0, COLOR_MIN[i]), [0, 1, 2])
}

const drawRRT = ({ rrt, pointsGraphics, linksGraphics }: State): void => {
  // const generationMax = R.reduce((acc, { generation }) => (acc > generation ? acc : generation), 0, rrt)
  const depthMax = R.reduce((acc, { depth }) => (acc > depth ? acc : depth), 0, rrt)
  rrt.forEach(point => {
    // $FlowIgnore he is wrong. number is 3
    const color: RGBArray = calcColor(point.depth, depthMax)
    if (point.parent !== null && point.parent !== undefined) {
      const parentDepth = rrt[point.parent].depth
      // когда у parent depth меньше чем у текущей точки тогда цвет связи выглядит неадекватно ярким
      // что воспринимается как баг подсчета depth
      const linkColor = parentDepth < point.depth ? calcColor(parentDepth, depthMax) : color
      drawRRTLink(linksGraphics, point, rrt[point.parent], linkColor, 1)
    }
    drawRRTPoint(pointsGraphics, point, color, [0, 0, 0], 1)
  })
}

const initGraphics = (state: State): State => state

const redraw = (state: State): State => {
  if (state.ticks % REDRAW_STEP === 1) {
    return initAll(state)
  }
  return state
}

export const init = (): void => startDrawer('circle', initGraphics, redraw)
