// @flow
// это про разрастание клеток. клетка делитчя и дает сразу две дочерние в выбранном или случайном
// направлении. такого не бывает в природе но и пофиг. направление роста задается при рождении клетки
// делится она только один раз. две дочерние появляются по углу от этого направления
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import * as U from 'common/utils'
import random from 'random'
import seedrandom from 'seedrandom'

import { initDrawer } from 'experimental/drawer'
// import { addDotsIntoCircleWithMinDistance } from 'experimental/random_points'
import type { DrawerState } from 'experimental/drawer'

type TissueState = {|
  ...DrawerState,
  seed: number,
  cells: Cells,
  cellAngle: number,
  // cellPossibleChildren: number,
  cellRadius: number,
  graphics: Object, // PIXI graphics
|}

type CellId = number
type Cell = {|
  id: CellId,
  x: number,
  y: number,
  direcion: number,
  parent: ?CellId,
  canFission: boolean,
|}
type Cells = {[CellId]: Cell}

// TODO write all coefs to seed and restore them from seed
const THROTTLE = 5

const initGraphics = (oldState: DrawerState): TissueState => {
  const state = { ...oldState }
  state.seed = Date.now()
  random.use(seedrandom(state))
  state.cellAngle = Math.PI / 12
  // state.cellPossibleChildren = 2
  state.cellRadius = state.size / 20
  const cell = { id: 1, x: 0, y: 0, direcion: 0, parent: null, canFission: true }
  state.cells = { [cell.id]: cell }
  state.graphics = new PIXI.Graphics()
  state.base_container.addChild(state.graphics)
  drawNewCells(state.cells, state.cellRadius)
  return state
}

const redraw = (oldState: TissueState): TissueState => {
  if (oldState.ticks % THROTTLE !== 0) {
    return oldState
  }
  const state = { ...oldState }
  const newCells = cellsFission(state.cells, state.cellRadius, state.cellAngle)
  // suppose all cells that could fission did it in cellsFission()
  state.cells = R.map(c => ({ ...c, canFission: false }), state.cells)
  state.cells = { ...state.cells, ...newCells }
  drawNewCells(newCells)
  return state
}

const cellsFission = (curCells: Cells, cellRadius: number, cellAngle: number): Cells => {
  const parents = R.filter(c => c.canFission)(R.values(curCells))
  const maxId = parents.reduce((max, e) => Math.max(max, e.id), 0)
  return parents.reduce((acc, pc, i) => {
    const d1 = U.fromPolarCoords({ angle: pc.direcion + cellAngle, radius: 2 * cellRadius })
    const p1 = { x: pc.x + d1.x, y: pc.y + d1.y }
    if (!isCellIntersect(p1, curCells, acc)) {
      const id1 = maxId + 2 * i
      acc[id1] = { id: id1, x: p1.x, y: p1.y, direcion: random.float(0, 2 * Math.PI), parent: pc.id, canFission: true }
    }
    // TODO remove dup code
    const d2 = U.fromPolarCoords({ angle: pc.direcion - cellAngle, radius: 2 * cellRadius })
    const p2 = { x: pc.x + d2.x, y: pc.y + d2.y }
    if (!isCellIntersect(p2, curCells, acc)) {
      const id2 = maxId + 2 * i + 1
      acc[id2] = { id: id2, x: p2.x, y: p2.y, direcion: random.float(0, 2 * Math.PI), parent: pc.id, canFission: true }
    }
  }, {})
}

const debugInfo = state => [
  { text: 'count cells', value: R.keys(state.cells).length },
  { text: 'seed', value: state.seed },
]

export const init = () => initDrawer('circle', debugInfo, initGraphics, redraw)
