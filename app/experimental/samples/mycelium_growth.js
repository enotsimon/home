// @flow
import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'
import * as R from 'ramda'

import * as Color from 'common/color'
import * as U from 'common/utils'
import { addCircleMask } from 'experimental/drawing_functions'
import { initDrawer } from 'experimental/drawer'
import { randomPointPolar } from 'experimental/random_points'

import type { InitDrawerResult, DrawerState } from 'experimental/drawer'
import type { XYPoint } from 'common/utils'
import type { RRTPoint } from 'common/rrt_diagram'

const STEP = 5
const REJECT_LIMIT = 100
const BRANCHING_THRESHOLD = 0.1

type PIXIContainer = Object // FIXME
// its like RRTPoint
export type CellId = number
type Cell = {|
  ...XYPoint,
  generation: number,
  index: CellId,
  parent: ?CellId,
|}
type State = {|
  ...DrawerState,
  cells: Array<Cell>,
  graphics: PIXIContainer,
|}
type CheckFunc = (XYPoint) => boolean

const initGraphics = (state: State): State => {
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.base_container.removeChildren()
  const graphics = new PIXI.Graphics()
  state.base_container.addChild(graphics)
  addCircleMask(state.base_container, state.size / 2, { x: 0, y: 0 }, [0, 100, 0])
  // after treeContour for z-index!
  const flashes = new PIXI.Graphics()
  graphics.addChild(flashes)
  return {
    ...state,
    graphics,
    cells: buildMycelium({ x: 0, y: 0 }, p => checkPointFunc(p, state.size / 2)),
  }
}

const buildMycelium = (startXYPoint: XYPoint, checkFunc: CheckFunc): Array<Cell> => {
  const startPoint = {
    ...startXYPoint,
    generation: 1,
    index: 1,
    parent: null,
  }
  return buildMyceliumRec([startPoint], checkFunc)
}

const buildMyceliumRec = (cells: Array<Cell>, checkFunc: CheckFunc): Array<Cell> => {
  const parents = R.reduce((acc, c) => (c.parent && !R.includes(c.parent, acc) ? [...acc, c.parent] : acc), [], cells)
  // thats cause cell that is parent for some other is apical no more
  const apicalCells = R.filter(p => !R.includes(p.index, parents), cells)
  const newCells = R.reduce((acc, apicalCell) => {
    let nCells = [...acc]
    // crap
    const newChildCell = addChildCell(nCells, apicalCell, checkFunc)
    if (!newChildCell) {
      return nCells
    }
    nCells = [...nCells, newChildCell]
    if (random.float() < BRANCHING_THRESHOLD) {
      const newChildCell2 = addChildCell(nCells, apicalCell, checkFunc)
      if (newChildCell2) {
        nCells = [...nCells, newChildCell2]
      }
    }
    return nCells
  }, cells, apicalCells)
  // no new cells added, exitting
  if (newCells.length === cells.length) {
    return newCells
  }
  return buildMyceliumRec(newCells, checkFunc)
}

const addChildCell = (cells: Array<Cell>, parent: Cell, checkFunc: CheckFunc, counter: number = 0): ?Cell => {
  if (counter >= REJECT_LIMIT) {
    return null
  }
  const { x, y } = U.fromPolarCoords(randomPointPolar(STEP))
  const newXYPoint = { x: x + parent.x, y: y + parent.y }
  // or STEP / 2 ?
  if (R.find(c => U.distance(c, newXYPoint) < STEP)) {
    return addChildCell(cells, parent, checkFunc, counter + 1)
  }
  if (!checkFunc(newXYPoint)) {
    return addChildCell(cells, parent, checkFunc, counter + 1)
  }
  return {
    ...newXYPoint,
    index: cells.length + 1,
    generation: parent.generation + 1,
    parent: parent.index,
  }
}

const checkPointFunc = (point: XYPoint, maxRadius: number): boolean => {
  return U.toPolarCoords(point).radius < maxRadius
}

const redraw = (state: State): State => {
  return state
}

/* eslint-disable-next-line no-unused-vars */
const drawCircle = (graphics: PIXIContainer, point: RRTPoint, maxGeneration: number): void => {
  const color = U.normalizeValue(maxGeneration - point.generation, maxGeneration, 255, 0, 75)
  // graphics.lineStyle(0, Color.to_pixi([0, 0, 0]))
  graphics.beginFill(Color.to_pixi([color, 0, 0]), 1)
  graphics.drawCircle(point.x, point.y, 0.5)
  graphics.endFill()
}

/* eslint-disable-next-line no-unused-vars */
const drawLine = (graphics: PIXIContainer, point: RRTPoint, parent: RRTPoint, maxGeneration: number): void => {
  const color = U.normalizeValue(maxGeneration - point.generation, maxGeneration, 125, 0, 50)
  const lineWidth = U.normalizeValue(maxGeneration - point.generation, maxGeneration, 2, 0, 0.25)
  graphics.lineStyle(lineWidth, Color.to_pixi([color, 0, 0]), 0.75)
  graphics.moveTo(parent.x, parent.y)
  graphics.lineTo(point.x, point.y)
}

export const init = (): InitDrawerResult => initDrawer('circle', () => [], initGraphics, redraw)
