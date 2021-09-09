// @flow
import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'
import * as R from 'ramda'

import * as Color from 'common/color'
import * as U from 'common/utils'
import { addCircleMask } from 'experimental/drawing_functions'
import { initDrawer } from 'experimental/drawer'
import { generate, pointsByGenerationsIndex } from 'common/rrt_diagram'
import { randomPointPolar } from 'experimental/random_points'

import type { InitDrawerResult, DrawerState } from 'experimental/drawer'
import type { RRTDiagram, RRTPoint, RRTGenerationsIndex } from 'common/rrt_diagram'

const STEP = 5
const BASIC_THROTTLE = 3

type PIXIContainer = Object // FIXME
type State = {|
  ...DrawerState,
  rrt: RRTDiagram,
  graphics: PIXIContainer,
  flashes: PIXIContainer,
  treeContour: PIXIContainer,
  curGeneration: number,
  pointsByGenerationsIndex: RRTGenerationsIndex,
|}

const initGraphics = (state: State): State => {
  const seed = Date.now()
  random.use(seedrandom(seed))
  const rrt = generate(STEP, randomPointFunc(state.size / 2), { x: 0, y: state.size / 2 })
  const pbgIndex = pointsByGenerationsIndex(rrt)
  state.base_container.removeChildren()
  const graphics = new PIXI.Graphics()
  state.base_container.addChild(graphics)
  addCircleMask(state.base_container, state.size / 2, { x: 0, y: 0 }, [100, 0, 0])
  const treeContour = drawTreeContour(rrt, pbgIndex, graphics)
  // after treeContour for z-index!
  const flashes = new PIXI.Graphics()
  graphics.addChild(flashes)
  return {
    ...state,
    graphics,
    flashes,
    treeContour,
    rrt,
    curGeneration: R.length(pbgIndex) - 1,
    pointsByGenerationsIndex: pbgIndex,
  }
}

const randomPointFunc = (radius: number) => () => U.fromPolarCoords(randomPointPolar(radius))

const redraw = (state: State): State => {
  if (state.ticks % BASIC_THROTTLE !== 0) {
    return state
  }
  const maxGeneration = R.length(state.pointsByGenerationsIndex) - 1
  if (state.curGeneration === -1) {
    console.log('new circle')
    return { ...state, curGeneration: maxGeneration }
  }
  state.flashes.clear()
  // TODO naive drawing of flashes trace, do normal!
  R.range(0, 5).forEach(i => {
    const curGenPoints = state.pointsByGenerationsIndex[state.curGeneration - i] || []
    curGenPoints.forEach(index => {
      const p = state.rrt[index]
      if (p.parent !== null && p.parent !== undefined) {
        drawFlashLine(state.flashes, p, state.rrt[p.parent], maxGeneration)
      }
      drawFlash(state.flashes, p, maxGeneration)
    })
  })
  return { ...state, curGeneration: state.curGeneration - 1 }
}

const drawTreeContour = (
  rrt: RRTDiagram,
  pbgIndex: RRTGenerationsIndex,
  baseContainer: PIXIContainer
): PIXIContainer => {
  const maxGeneration = R.length(pbgIndex) - 1
  const treeContour = new PIXI.Graphics()
  pbgIndex.forEach(gen => gen.forEach(index => {
    const p = rrt[index]
    if (p.parent !== null && p.parent !== undefined) {
      drawLine(treeContour, p, rrt[p.parent], maxGeneration)
    }
    drawCircle(treeContour, p, maxGeneration)
  }))
  baseContainer.addChild(treeContour)
  return treeContour
}

const drawFlash = (graphics: PIXIContainer, point: RRTPoint, maxGeneration: number): void => {
  const rC = U.normalizeValue(maxGeneration - point.generation, maxGeneration, 255, 0, 75)
  const oCs = U.normalizeValue(maxGeneration - point.generation, maxGeneration, 200, 0, 100)
  const radius = U.normalizeValue(maxGeneration - point.generation, maxGeneration, 1.5, 0, 0.5)
  // graphics.lineStyle(0, Color.to_pixi([0, 0, 0]))
  graphics.beginFill(Color.to_pixi([rC, oCs, oCs])) // 0.75 ?
  graphics.drawCircle(point.x, point.y, radius)
  graphics.endFill()
}

const drawFlashLine = (graphics: PIXIContainer, point: RRTPoint, parent: RRTPoint, maxGeneration: number): void => {
  const rC = U.normalizeValue(maxGeneration - point.generation, maxGeneration, 255, 0, 75)
  const oCs = U.normalizeValue(maxGeneration - point.generation, maxGeneration, 200, 0, 100)
  const lineWidth = U.normalizeValue(maxGeneration - point.generation, maxGeneration, 1, 0, 0.25)
  graphics.lineStyle(lineWidth, Color.to_pixi([rC, oCs, oCs]))
  graphics.moveTo(parent.x, parent.y)
  graphics.lineTo(point.x, point.y)
}

const drawCircle = (graphics: PIXIContainer, point: RRTPoint, maxGeneration: number): void => {
  const color = U.normalizeValue(maxGeneration - point.generation, maxGeneration, 255, 0, 75)
  // graphics.lineStyle(0, Color.to_pixi([0, 0, 0]))
  graphics.beginFill(Color.to_pixi([color, 0, 0]), 1)
  graphics.drawCircle(point.x, point.y, 0.5)
  graphics.endFill()
}

const drawLine = (graphics: PIXIContainer, point: RRTPoint, parent: RRTPoint, maxGeneration: number): void => {
  const color = U.normalizeValue(maxGeneration - point.generation, maxGeneration, 125, 0, 50)
  const lineWidth = U.normalizeValue(maxGeneration - point.generation, maxGeneration, 2, 0, 0.25)
  graphics.lineStyle(lineWidth, Color.to_pixi([color, 0, 0]), 0.75)
  graphics.moveTo(parent.x, parent.y)
  graphics.lineTo(point.x, point.y)
}

export const init = (): InitDrawerResult => initDrawer('circle', () => [], initGraphics, redraw)
