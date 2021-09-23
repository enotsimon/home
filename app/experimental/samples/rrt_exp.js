// @flow
import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'

import * as Color from 'common/color'
import * as U from 'common/utils'
import * as R from 'ramda'
import { addCircleMask } from 'experimental/drawing_functions'
import { startDrawer } from 'experimental/drawer'
import { generate } from 'common/rrt_diagram'
import { randomPointPolar } from 'experimental/random_points'

import type { DrawerState } from 'experimental/drawer'
import type { RRTDiagram, RRTPoint } from 'common/rrt_diagram'

const STEP = 5
const INDEX_BORDER = 0.4
const REBUIND_AFTER = 5000

type State = {|
  ...DrawerState,
  rrt: RRTDiagram,
  graphics: Object,
|}

const initGraphics = (state: State): State => {
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.base_container.removeChildren()
  const graphics = new PIXI.Graphics()
  state.base_container.addChild(graphics)
  addCircleMask(graphics, state.size / 2, { x: 0, y: 0 }, [100, 0, 0])
  const rrt = generate(STEP, randomPointFunc(state.size / 2), U.fromPolarCoords(randomPointPolar(state.size / 2)))
  // $FlowIgnore
  rrt.forEach(point => drawCircleAndLine(graphics, point, rrt[point.parent], rrt.length))
  drawLinks(rrt, graphics)
  return {
    ...state,
    graphics,
    rrt,
  }
}

const randomPointFunc = (radius: number) => () => U.fromPolarCoords(randomPointPolar(radius))

const redraw = (state: State): State => {
  if ((state.ticks + 1) % REBUIND_AFTER === 0) {
    return initGraphics(state)
  }
  return state
}

const drawCircleAndLine = (graphics: Object, point: RRTPoint, parent: ?RRTPoint, countPoints: number): void => {
  const pointTone = 200
  const lineTone = 100
  const lineWidth = 1
  const [lineColorArr, pointColorArr] = getColors(point.index, countPoints, pointTone, lineTone)
  graphics.beginFill(Color.to_pixi(pointColorArr), 1)
  graphics.drawCircle(point.x, point.y, 0.5)
  graphics.endFill()
  if (parent) {
    graphics.lineStyle(lineWidth, Color.to_pixi(lineColorArr), 0.5)
    graphics.moveTo(parent.x, parent.y)
    graphics.lineTo(point.x, point.y)
  }
}

const getColors = (index, countPoints, pointTone, lineTone) => {
  if (index < INDEX_BORDER * countPoints) {
    return [[lineTone, lineTone / 4, 0], [pointTone, pointTone / 4, 0]]
  }
  return [[0, 0, 0], [pointTone, 0, 0]]
}

const drawLinks = (rrt, graphics) => {
  graphics.lineStyle(0.5, Color.to_pixi([100, 0, 0]), 0.5)
  const qd = STEP ** 2
  const lowPoints = R.filter(point => point.index > INDEX_BORDER * rrt.length, rrt)
  U.noOrderNoSameValuesPairs(lowPoints).forEach(([p1, p2]) => {
    if (((p1.x - p2.x) ** 2) + ((p1.y - p2.y) ** 2) <= 3 * qd) {
      graphics.moveTo(p1.x, p1.y)
      graphics.lineTo(p2.x, p2.y)
    }
  })
}

export const init = (): void => startDrawer('circle', initGraphics, redraw)
