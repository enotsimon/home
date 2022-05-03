// @flow
/**
 * попробуем возродить идею карты из rrt
 * rrt это горные хребты
 */
import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'
// import * as R from 'ramda'

import * as Color from 'common/color'
import * as U from 'common/utils'
// import { addCircleMask } from 'experimental/drawing_functions'
import { startDrawer } from 'experimental/drawer'
import { generate } from 'common/rrt_diagram'
import { randomPointPolar } from 'experimental/random_points'

import type { DrawerState } from 'experimental/drawer'
import type { RRTDiagram, RRTPoint } from 'common/rrt_diagram'

const STEP = 5
const COLOR_MAX = [0, 255, 0]
// const COLOR_MIN = [0, 25, 0]

type State = {|
  ...DrawerState,
  rrt: RRTDiagram,
  pointsGraphics: Object,
  linksGraphics: Object,
|}

const initGraphics = (state: State): State => {
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.base_container.removeChildren()
  // order emulates z-index!
  // addCircleMask(state.base_container, state.size / 2, { x: 0, y: 0 }, COLOR_MIN)
  const linksGraphics = new PIXI.Graphics()
  state.base_container.addChild(linksGraphics)
  const pointsGraphics = new PIXI.Graphics()
  state.base_container.addChild(pointsGraphics)
  const rrt = generate(STEP, randomPointFunc(state.size / 2), { x: 0, y: 0 })
  console.log('cnt points', rrt.length)

  const newState = { ...state, rrt, pointsGraphics, linksGraphics }
  drawRRT(newState)

  return newState
}

const randomPointFunc = (radius: number) => () => U.fromPolarCoords(randomPointPolar(radius))

const drawRRT = ({ rrt, pointsGraphics, linksGraphics }: State): void => {
  // const generationMax = R.reduce((acc, { generation }) => (acc > generation ? acc : generation), 0, rrt)
  rrt.forEach(point => {
    if (point.parent !== null && point.parent !== undefined) {
      // console.log(point)
      drawLink(linksGraphics, point, rrt[point.parent], COLOR_MAX, 1)
    }
    drawPoint(pointsGraphics, point, COLOR_MAX, [0, 0, 0], 1)
  })
}

const redraw = (state: State): State => {
  return state
}

const drawPoint = (graphics: Object, point: RRTPoint, color, bgColor, radius): void => {
  graphics.beginFill(Color.to_pixi(color), 1)
  graphics.drawCircle(point.x, point.y, radius)
  graphics.endFill()
  graphics.beginFill(Color.to_pixi(bgColor), 1)
  graphics.drawCircle(point.x, point.y, radius / 2)
  graphics.endFill()
}

const drawLink = (graphics, point, parent: RRTPoint, color, width): void => {
  graphics.lineStyle(width, Color.to_pixi(color), 1)
  graphics.moveTo(parent.x, parent.y)
  graphics.lineTo(point.x, point.y)
}

export const init = (): void => startDrawer('circle', initGraphics, redraw)
