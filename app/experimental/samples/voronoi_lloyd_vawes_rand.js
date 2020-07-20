// @flow
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'
// import * as R from 'ramda'
import * as U from 'common/utils'
import random from 'random'
import seedrandom from 'seedrandom'
import { generate } from 'common/voronoi'
import { initDrawer } from 'experimental/drawer'
import { addCircleMask } from 'experimental/drawing_functions'
import { randomPointPolar, randomPointsInSquare } from 'experimental/random_points'

import type { DrawerState, DrawerOnTickCallback, DrawerDebugInfoUnit } from 'experimental/drawer'
import type { VoronoiDiagram } from 'common/voronoi'
import type { ChannelMatrix } from 'common/color'

// TODO get rid of all copy-paste from voronoi_lloyd_vawes

type State = {|
  ...DrawerState,
  step: number,
  generation: number,
  rotation: number,
  voronoi: VoronoiDiagram,
  voronoiGraphics: Object,
  colorMatrixes: Array<ChannelMatrix>,
|}

const LLOYD_MAX_STEPS = 50000
const LLOYD_WAVE = 250
const LLOYD_TO_MOVE = 0.25
const COUNT_POINTS = 75
// WARNING!!!!!!! DONT SET IT LARGER! OR POINTS COUNT GROWS FAST!
const DISTANCE_TO_DELETE = 1.2

const initGraphics = (oldState: DrawerState): State => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.generation = 1
  const points = randomPoints(COUNT_POINTS, state.size, state.generation)
  state.step = 0
  state.rotation = 0
  state.colorMatrixes = Color.allChannelMatrixes(2).sort(() => random.float(-1, 1))
  state.voronoi = generate(points, state.size, state.size, 0)
  return state
}

const redraw = (oldState: State): State => {
  const state = { ...oldState }
  if (state.step > LLOYD_MAX_STEPS) {
    return state
  }
  // we copy only { x, y, generation } from cells! or they grow recursively very fast!!!
  let points = state.voronoi.cells.map(({ x, y, generation }) => ({ x, y, generation }))
  const hSize = state.size / 2
  points = points.filter(p => U.distance(p, { x: hSize, y: hSize }) <= DISTANCE_TO_DELETE * hSize)
  // add some dynamic madness
  if (state.step % LLOYD_WAVE === (LLOYD_WAVE - 1)) {
    state.generation += 1
    points = [...points, ...randomPoints(COUNT_POINTS, state.size, state.generation)]
    console.log('STEP', state.generation, 'COUNT POINTS', points.length)
  }
  state.base_container.removeChildren()
  const voronoi = generate(points, state.size, state.size, 1, LLOYD_TO_MOVE)
  return {
    ...state,
    voronoi,
    step: state.step + 1,
    voronoiGraphics: drawDiagram(state.base_container, voronoi, state.size, state.colorMatrixes),
  }
}

const randomPoints = (count: number, size: number, generation: number) => {
  const { x: xc, y: yc } = U.fromPolarCoords(randomPointPolar(size / 2))
  return randomPointsInSquare(count).map(e => ({ x: e.x + xc + size / 2, y: e.y + yc + size / 2, generation }))
}

// TODO remove copy-paste
const drawDiagram = (parentContainer: Object, voronoi: VoronoiDiagram, size: number, colorMatrixes): Object => {
  const center = { x: size / 2, y: size / 2 }
  const graphics = new PIXI.Graphics()
  graphics.lineStyle(size / 200, Color.to_pixi([255, 255, 255]), 1)
  parentContainer.addChild(graphics)
  addCircleMask(graphics, size / 2, center)
  voronoi.cells.forEach(cell => {
    // $FlowIgnore will fix voronoi soon
    const { r, g, b } = colorMatrixes[cell.generation % colorMatrixes.length]
    const c = U.distance(cell, center) / (size / 2)
    graphics.beginFill(Color.to_pixi([r - c * r * 4 / 5, g - c * g * 4 / 5, b - c * b * 4 / 5]), 1)
    cell.nodes.forEach((node, i) => {
      /* eslint-disable-next-line no-unused-expressions */
      i === 0 ? graphics.moveTo(node.x, node.y) : graphics.lineTo(node.x, node.y)
    })
    graphics.closePath()
  })
  return graphics
}

const updateDebugInfo = (state: State): Array<DrawerDebugInfoUnit> => [
  { text: 'lloyd relaxation step (0.1)', value: state.step },
]

export const init = (drawerOnTickCallback: DrawerOnTickCallback) => initDrawer(
  // thats because d3.voronoi cant handle negative values!
  'square',
  updateDebugInfo,
  initGraphics,
  redraw,
  drawerOnTickCallback,
)
