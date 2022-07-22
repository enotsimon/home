// @flow
import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'
import * as R from 'ramda'

import { to_pixi } from 'enot-simon-utils/lib/color'
// import * as U from 'enot-simon-utils/lib/utils'
import { startDrawer } from 'experimental/drawer'
import { randomPointsInSquare } from 'enot-simon-utils/lib/random_points'
import { generate } from '../../common/voronoi'
import { drawDottedPoint, drawLine } from '../drawing_functions'

import type { DrawerState } from 'experimental/drawer'
import type { XYPoint } from 'enot-simon-utils/lib/utils'
import type { RGBArray } from 'enot-simon-utils/lib/color'

const ROOT_THROTTLE = 20
// TODO нужно считать его в внутренних тиках от ROOT_THROTTLE чтобы кратно было
const RECALC_DEPOSITES_THROTTLE = 100
const CNT_POINTS = 25
const LLOYD_TO_MOVE = 1
const LLOYD_STEPS = 2

type Record<Key: string | number, T: Object> = {| [Key]: T |}
type PIXIContainer = Object // FIXME

type ResourceId = string
type DepositeId = string
type CellId = string

type FromTo = {| from: number, to: number |}
type Resource = {|
  id: ResourceId,
  name: string,
  color: RGBArray,
  amount: FromTo,
  gain: FromTo,
  max: number,
  chance: number,
|}
type ResourcesConfig = {| [ResourceId]: Resource |}

type Cell = {|
  ...XYPoint,
  id: CellId,
  deposites: Array<DepositeId>,
  links: Array<CellId>,
|}
type Deposite = {|
  id: DepositeId,
  resource: ResourceId,
  amount: number,
  gain: number,
  max: number,
|}
type Cells = Record<CellId, Cell>
type Deposites = Record<DepositeId, Deposite>
type State = {|
  ...DrawerState,
  resources: ResourcesConfig,
  cells: Cells,
  deposites: Deposites,
  graphics: PIXIContainer,
|}

const resourcesConfig: ResourcesConfig = R.indexBy(R.prop('id'), [
  {
    id: 'green',
    name: 'green resource',
    color: [0, 150, 0],
    amount: { from: 0, to: 0 },
    gain: { from: 10, to: 50 },
    max: 5000,
    chance: 0.5,
  },
  {
    id: 'orange',
    name: 'orange resource',
    color: [150, 150, 0],
    amount: { from: 100, to: 1000 },
    gain: { from: 0, to: 0 },
    max: 5000,
    chance: 0.5,
  },
])

const initGraphics = (state: DrawerState): State => {
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.base_container.removeChildren()

  // addCircleMask(state.base_container, state.size / 2, { x: 0, y: 0 }, [0, 100, 0])
  const points = randomPointsInSquare(CNT_POINTS, state.size).map((e, i) => ({ x: e.x, y: e.y, id: `point_${i}` }))
  const voronoi = generate(points, state.size, state.size, LLOYD_STEPS, LLOYD_TO_MOVE)
  const noDepositesCells = R.indexBy(R.prop('id'), R.map(e => ({
    x: e.x,
    y: e.y,
    id: e.id,
    links: R.map(R.prop('id'), e.links),
    deposites: [],
  }), voronoi.cells))
  const [cells, deposites] = randomDeposites(noDepositesCells, resourcesConfig)
  console.log('cells', cells)
  initAndDrawLinks(cells, state.base_container)
  initAndDrawCells(cells, state.base_container)
  initTextLayer(state.base_container)
  return {
    ...state,
    resources: resourcesConfig,
    deposites,
    cells,
  }
}

const randomDeposites = (cellsOrig: Cells, config: ResourcesConfig): [Cells, Deposites] => {
  const cells = {}
  let depositesArray = []
  R.forEach(cellId => {
    const deposites = randomCellDeposites(cellId, config)
    depositesArray = depositesArray.concat(deposites)
    const depositeIds = R.map(R.prop('id'), deposites)
    const cell = { ...cellsOrig[cellId], deposites: depositeIds }
    cells[cell.id] = cell
  }, R.keys(cellsOrig))
  return [cells, R.indexBy(R.prop('id'), depositesArray)]
}

const randomCellDeposites = (cellId: CellId, config: ResourcesConfig): Array<Deposite> => {
  const deposites = []
  R.forEach(e => {
    if (random.float() >= e.chance) {
      return
    }
    const deposite = {
      id: depositeId(cellId, e.id),
      resource: e.id,
      amount: randFromTo(e.amount),
      gain: randFromTo(e.gain),
      max: e.max,
    }
    deposites.push(deposite)
  }, R.values(config))
  return deposites
}

const depositeId = (cellId: CellId, resourceId: ResourceId): string => `deposite_${cellId}_${resourceId}`
const randFromTo = (conf) => random.int(conf.from, conf.to)
const getCellDeposites = (cell, deposites): Array<Deposite> => R.map(id => deposites[id], cell.deposites)

const initAndDrawCells = (cells, container) => {
  const cellsGraphics = new PIXI.Graphics()
  container.addChild(cellsGraphics)
  R.forEach(p => {
    const graphics = drawDottedPoint([255, 255, 255], 0.75)
    graphics.x = p.x
    graphics.y = p.y
    graphics.name = cellGraphicsName(p.id)
    cellsGraphics.addChild(graphics)
  }, R.values(cells))
}

const initAndDrawLinks = (cells, container) => {
  const linksGraphics = new PIXI.Graphics()
  container.addChild(linksGraphics)
  const links = R.pipe(
    R.values,
    R.chain(cell => R.map(l => [cell.id, l], cell.links)),
    R.map(R.sort(R.comparator(R.lt))),
    R.uniq
  )(cells)
  R.forEach(([c1, c2]) => {
    drawLine(container, [255, 255, 255], 0.25, cells[c1], cells[c2])
  }, links)
}

const initTextLayer = (container) => {
  const text = new PIXI.Graphics()
  text.name = 'text'
  container.addChild(text)
}

const redrawTextLayer = (cells, deposites, resources, container) => {
  const textContainer = container.getChildByName('text')
  textContainer.removeChildren()
  R.forEach(cell => drawCellText(cell, deposites, resources, textContainer), R.values(cells))
}

const drawCellText = (cell, deposites, resources, textContainer): void => {
  const cellDeposites = getCellDeposites(cell, deposites)
  const basicMargin = 1
  const lineHeight = 1.8
  R.reduce((margin, deposite) => {
    const resource = resources[deposite.resource]
    const text = new PIXI.Text(
      `${resource.name}: ${deposite.amount}`,
      { fontFamily: 'Arial', fontSize: 16, fontStyle: 'bold', fill: to_pixi(resource.color) }
    )
    text.scale = { x: 0.1, y: 0.1 }
    text.x = cell.x
    text.y = cell.y + margin
    textContainer.addChild(text)
    return margin + lineHeight
  }, basicMargin, cellDeposites)
}

const cellGraphicsName = id => `cell_${id}`

const redraw = (state: State): State => {
  if (state.ticks % ROOT_THROTTLE === 1) {
    return innerTick(state)
  }
  return state
}

const innerTick = (oldState: State): State => {
  const state = oldState.ticks % RECALC_DEPOSITES_THROTTLE === 1 ? recalcDeposites(oldState) : oldState
  redrawTextLayer(state.cells, state.deposites, state.resources, state.base_container)
  return state
}

const recalcDeposites = (state) => {
  const deposites = R.map(deposite => {
    // суть в том что если на генерации мы положили в deposite больше чем max то оставим как есть
    const flexMax = Math.max(deposite.max, deposite.amount)
    return { ...deposite, amount: Math.min(deposite.amount + deposite.gain, flexMax) }
  }, state.deposites)
  return { ...state, deposites }
}

export const init = (): void => startDrawer('square', initGraphics, redraw)
