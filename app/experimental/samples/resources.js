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
const CREATURES_PER_CELL = 10

type Record<Key: string | number, T: Object> = {| [Key]: T |}

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
  links: Array<CellId>,
|}

type DepositeId = string
type Deposite = {|
  id: DepositeId,
  resource: ResourceId,
  amount: number,
  gain: number,
  max: number,
  location: CellId,
|}

type FoodConsumptionConfig = {| [ResourceId]: FoodConsumption |}
type FoodConsumption = {|
  id: ResourceId,
  consume: number,
  satiation: number,
|}

type RaceId = string
type Race = {|
  id: RaceId,
  name: string,
  plural: string,
  color: RGBArray,
  // inanimate: boolean,
  food: FoodConsumptionConfig,
  endurance: FromTo,
  satiationStep: number,
  satiationDecrease: number,
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
  endurance: number,
  location: CellId,
|}

type Cells = Record<CellId, Cell>
type Deposites = Record<DepositeId, Deposite>
type Creatures = Record<CreatureId, Creature>
type State = {|
  ...DrawerState,
  // autoincrement id counters
  ids: {| creature: number |},
  resourcesConfig: ResourcesConfig,
  racesConfig: RacesConfig,
  cells: Cells,
  deposites: Deposites,
  creatures: Creatures,
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
    plural: 'humans',
    color: [255, 165, 0],
    satiationStep: 50, // max satiation = satiationStep * endurance
    satiationDecrease: 5,
    food: U.indexById([
      { id: 'apples', consume: 1, satiation: 1 },
      { id: 'mushrooms', consume: 2, satiation: 1 },
    ]),
    endurance: { from: 1, to: 10 },
  }
])

const initGraphics = (state: DrawerState): State => {
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.base_container.removeChildren()
  // addCircleMask(state.base_container, state.size / 2, { x: 0, y: 0 }, [0, 100, 0])

  const blankState: State = {
    ...state,
    ids: { creature: 1 },
    resourcesConfig: rootResourcesConfig,
    racesConfig: rootRacesConfig,
    deposites: {},
    cells: {},
    creatures: {},
  }
  const newState = R.pipe(...initStateHandlers)(blankState)
  // console.log('creatures', newState.creatures, newState.ids)

  R.juxt(initGraphicsHandlers)(newState)
  return newState
}

const randomCellDeposites = (cellId: CellId, resourcesConfig: ResourcesConfig): Array<Deposite> => {
  const deposites = []
  R.forEach(e => {
    if (random.float() >= e.chance) {
      return
    }
    const deposite = {
      id: buildDepositeId(cellId, e.id),
      resource: e.id,
      amount: randFromTo(e.amount),
      gain: randFromTo(e.gain),
      max: e.max,
      location: cellId,
    }
    deposites.push(deposite)
  }, R.values(resourcesConfig))
  return deposites
}

const buildDepositeId = (cellId: CellId, resourceId: ResourceId): string => `deposite_${cellId}_${resourceId}`
const randFromTo = (conf) => random.int(conf.from, conf.to)

const cellDeposites = (cellId, deposites): Array<Deposite> => R.filter(e => e.location === cellId, R.values(deposites))
const cellCreatures = (cellId, creatures): Array<Creature> => R.filter(e => e.location === cellId, R.values(creatures))

const initAndDrawCells = ({ cells, base_container }: State): void => {
  const cellsGraphics = new PIXI.Graphics()
  base_container.addChild(cellsGraphics)
  R.forEach(p => {
    const graphics = drawDottedPoint([255, 255, 255], 0.75)
    graphics.x = p.x
    graphics.y = p.y
    graphics.name = cellGraphicsName(p.id)
    cellsGraphics.addChild(graphics)
  }, R.values(cells))
}

const initAndDrawLinks = ({ cells, base_container }: State): void => {
  const linksGraphics = new PIXI.Graphics()
  base_container.addChild(linksGraphics)
  const links = R.pipe(
    R.values,
    R.chain(cell => R.map(l => [cell.id, l], cell.links)),
    R.map(R.sort(R.comparator(R.lt))),
    R.uniq
  )(cells)
  R.forEach(([c1, c2]) => {
    drawLine(base_container, [255, 255, 255], 0.25, cells[c1], cells[c2])
  }, links)
}

const initTextLayer = ({ base_container }: State): void => {
  const text = new PIXI.Graphics()
  text.name = 'text'
  base_container.addChild(text)
}

const redrawTextLayer = (state: State): void => {
  const textContainer = state.base_container.getChildByName('text')
  textContainer.removeChildren()
  R.forEach(cell => drawCellText(cell, state, textContainer), R.values(state.cells))
}

const drawCellText = (cell, state, textContainer): void => {
  const basicMargin = 1
  const lineHeight = 1.8
  // creatures
  const cellCreatureRaces = R.reduce((acc, e) => {
    acc[e.race] = acc[e.race] ? acc[e.race] + 1 : 1
    return acc
  }, {}, cellCreatures(cell.id, state.creatures))
  const depositesMargin = R.reduce((margin, [raceId, amount]) => {
    const race = state.racesConfig[raceId]
    const text = new PIXI.Text(
      `${race.plural}: ${amount}`,
      { fontFamily: 'Arial', fontSize: 16, fontStyle: 'bold', fill: to_pixi(race.color) }
    )
    text.scale = { x: 0.1, y: 0.1 }
    text.x = cell.x
    text.y = cell.y + margin
    textContainer.addChild(text)
    return margin + lineHeight
  }, basicMargin, R.toPairs(cellCreatureRaces))
  // deposites
  R.reduce((margin, deposite) => {
    const resource = state.resourcesConfig[deposite.resource]
    const text = new PIXI.Text(
      `${resource.name}: ${deposite.amount}`,
      { fontFamily: 'Arial', fontSize: 16, fontStyle: 'bold', fill: to_pixi(resource.color) }
    )
    text.scale = { x: 0.1, y: 0.1 }
    text.x = cell.x
    text.y = cell.y + margin
    textContainer.addChild(text)
    return margin + lineHeight
  }, depositesMargin, cellDeposites(cell.id, state.deposites))
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
  R.juxt(tickRedrawHandlers)(state)
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

const hunger = (state: State): State => {
  const creatures = R.map(creature => {
    const creatureRace = state.racesConfig[creature.race]
    return { ...creature, satiation: creature.satiation - creatureRace.satiationDecrease }
  }, state.creatures)
  return { ...state, creatures }
}

const foodConsumption = (oldState: State): State => {
  /*
  const state = { ...oldState }
  R.forEach(cell => {
    const deposites = cellDeposites(cell.id, state.deposites)
    const creatures = cellCreatures(cell.id, state.creatures)
    R.forEach(creature => {
      const creatureRace = state.racesConfig[creature.race]
      const food = R.filter(deposite => R.includes(deposite.resource, R.keys(creatureRace.food)))
    }, creatures)
  }, R.values(state.cells))
  return state
  */
  return oldState
}

const starvationDeath = (state: State): State => {
  const creatures = R.filter(creature => creature.satiation > 0, state.creatures)
  return { ...state, creatures }
}

const tickHandlers: Array<(state: State) => State> = [
  recalcDeposites,
  hunger,
  foodConsumption,
  starvationDeath,
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
  }), voronoi.cells))
  return { ...state, cells }
}

const randomDeposites = (state: State): State => {
  let depositesArray = []
  R.forEach(cellId => {
    const deposites = randomCellDeposites(cellId, state.resourcesConfig)
    depositesArray = depositesArray.concat(deposites)
  }, R.keys(state.cells))
  return { ...state, deposites: U.indexById(depositesArray) }
}

// copy-paste from randomDeposites
const randomCreatures = (state: State): State => {
  let creaturesArray = []
  let curCreatureId = state.ids.creature
  R.forEach(cellId => {
    const creatures = randomCellCreatures(cellId, curCreatureId, state.racesConfig)
    creaturesArray = creaturesArray.concat(creatures)
    curCreatureId += creatures.length
  }, R.keys(state.cells))
  return { ...state, creatures: U.indexById(creaturesArray), ids: { ...state.ids, creature: curCreatureId } }
}

const randomCellCreatures = (cellId, curCreatureId, racesConfig): Array<Creature> => {
  const cellRaceId = U.randElement(R.keys(racesConfig))
  return R.map(i => {
    return {
      id: `${curCreatureId + i}`,
      name: `creature ${curCreatureId + i}`,
      age: 20,
      gender: U.randElement(['male', 'female']),
      race: cellRaceId,
      satiation: 100,
      endurance: random.int(racesConfig[cellRaceId].endurance.from, racesConfig[cellRaceId].endurance.to),
      location: cellId,
    }
  }, R.range(0, CREATURES_PER_CELL))
}

const initStateHandlers: Array<(state: State) => State> = [
  randomCells,
  randomDeposites,
  randomCreatures,
]

const initGraphicsHandlers = [
  initAndDrawLinks,
  initAndDrawCells,
  initTextLayer,
]

export const init = (): void => startDrawer('square', initGraphics, redraw)
