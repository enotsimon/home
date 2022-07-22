// @flow
import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'
import * as R from 'ramda'

import { to_pixi } from 'enot-simon-utils/lib/color'
import * as U from 'enot-simon-utils/lib/utils'
import { startDrawer } from 'experimental/drawer'
import { randomPointsInSquare } from 'enot-simon-utils/lib/random_points'
import { generate } from '../../common/voronoi'
import { drawDottedPoint, drawLine } from '../drawing_functions'

import type { DrawerState } from 'experimental/drawer'
import type { XYPoint } from 'enot-simon-utils/lib/utils'
import type { RGBArray } from 'enot-simon-utils/lib/color'

const ROOT_THROTTLE = 100
// const TICKS_IN_YEAR = 12
const CNT_POINTS = 25
const LLOYD_TO_MOVE = 1
const LLOYD_STEPS = 2

type Record<Key: string | number, T: Object> = {| [Key]: T |}
type PIXIContainer = Object // FIXME

type FromTo = {| from: number, to: number |}

type ResourceId = string
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

type CellId = string
type Cell = {|
  ...XYPoint,
  id: CellId,
  deposites: Array<DepositeId>,
  creatures: Array<CreatureId>,
  links: Array<CellId>,
|}

type DepositeId = string
type Deposite = {|
  id: DepositeId,
  resource: ResourceId,
  amount: number,
  gain: number,
  max: number,
|}

type FoodConsumptionConfig = {| [ResourceId]: FoodConsumption |}
type FoodConsumption = {|
  id: ResourceId,
  consume: number,
  calories: number,
|}

type RaceId = string
type Race = {|
  id: RaceId,
  name: string,
  food: FoodConsumptionConfig,
|}
type RacesConfig = {| [RaceId]: Race |}

type Gender = 'male' | 'female' | 'inanimate'
type CreatureId = string
type Creature = {|
  id: CreatureId,
  name: string,
  age: number, // in ticks
  gender: Gender,
  race: RaceId,
  satiation: number,
|}

type Cells = Record<CellId, Cell>
type Deposites = Record<DepositeId, Deposite>
type Creatures = Record<CreatureId, Creature>
type State = {|
  ...DrawerState,
  resourcesConfig: ResourcesConfig,
  cells: Cells,
  deposites: Deposites,
  creatures: Creatures,
  graphics: PIXIContainer,
|}

const rootResourcesConfig: ResourcesConfig = U.indexById([
  {
    id: 'apples',
    name: 'apples',
    color: [0, 150, 0],
    amount: { from: 0, to: 0 },
    gain: { from: 5, to: 20 },
    max: 1000,
    chance: 0.5,
  },
  {
    id: 'mushrooms',
    name: 'mushrooms',
    color: [150, 150, 0],
    amount: { from: 100, to: 1000 },
    gain: { from: 0, to: 0 },
    max: 1000,
    chance: 0.5,
  },
])

const rootRacesConfig: RacesConfig = U.indexById([
  {
    id: 'human',
    name: 'human',
    food: U.indexById([
      { id: 'apples', consume: 2, calories: 1 },
      { id: 'mushrooms', consume: 2, calories: 1 },
    ]),
  }
])

const initGraphics = (state: DrawerState): State => {
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.base_container.removeChildren()
  // addCircleMask(state.base_container, state.size / 2, { x: 0, y: 0 }, [0, 100, 0])

  // cells
  const blankState = {
    ...state,
    resourcesConfig: rootResourcesConfig,
    racesConfig: rootRacesConfig,
    deposites: {},
    cells: {},
    creatures: {},
  }

  const newState = R.pipe(...initStateHandlers)(blankState)

  // deposites
  // const [cells, deposites] = randomDeposites(blankCells, rootResourcesConfig)
  // creatures
  initAndDrawLinks(newState.cells, newState.base_container)
  initAndDrawCells(newState.cells, newState.base_container)
  initTextLayer(state.base_container)
  return newState
}

const randomCellDeposites = (cellId: CellId, resourcesConfig: ResourcesConfig): Array<Deposite> => {
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
  }, R.values(resourcesConfig))
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

const redrawTextLayer = ({ cells, deposites, resourcesConfig, base_container }): void => {
  const textContainer = base_container.getChildByName('text')
  textContainer.removeChildren()
  R.forEach(cell => drawCellText(cell, deposites, resourcesConfig, textContainer), R.values(cells))
}

const drawCellText = (cell, deposites, resourcesConfig, textContainer): void => {
  const cellDeposites = getCellDeposites(cell, deposites)
  const basicMargin = 1
  const lineHeight = 1.8
  R.reduce((margin, deposite) => {
    const resource = resourcesConfig[deposite.resource]
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
  const state = R.pipe(...tickHandlers)(oldState)
  R.pipe(...tickRedrawHandlers)(state)
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

const tickHandlers: Array<(state: State) => State> = [
  recalcDeposites,
]

const tickRedrawHandlers: Array<(state: State) => void> = [
  redrawTextLayer,
]

const randomCells = (state: State): State => {
  const points = randomPointsInSquare(CNT_POINTS, state.size).map((e, i) => ({ x: e.x, y: e.y, id: `point_${i}` }))
  const voronoi = generate(points, state.size, state.size, LLOYD_STEPS, LLOYD_TO_MOVE)
  const cells = U.indexById(R.map(e => ({
    x: e.x,
    y: e.y,
    id: e.id,
    links: R.map(R.prop('id'), e.links),
    deposites: [],
    creatures: [],
  }), voronoi.cells))
  return { ...state, cells }
}

const randomDeposites = (state: State): State => {
  const cells = {}
  let depositesArray = []
  R.forEach(cellId => {
    const deposites = randomCellDeposites(cellId, state.resourcesConfig)
    depositesArray = depositesArray.concat(deposites)
    const depositeIds = R.map(R.prop('id'), deposites)
    const cell = { ...state.cells[cellId], deposites: depositeIds }
    cells[cell.id] = cell
  }, R.keys(state.cells))
  return { ...state, cells, deposites: U.indexById(depositesArray) }
}

const randomCreatures = (state: State): State => {
  return state
}

const initStateHandlers: Array<(state: State) => State> = [
  randomCells,
  randomDeposites,
  randomCreatures,
]

export const init = (): void => startDrawer('square', initGraphics, redraw)
