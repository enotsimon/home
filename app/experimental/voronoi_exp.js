// @flow
import Color from 'common/color'
import * as PIXI from 'pixi.js'
// import * as R from 'ramda'
import * as U from 'common/utils'
import random from 'random'
import seedrandom from 'seedrandom'

import { generate } from 'common/voronoi'
import { initDrawer } from 'experimental/drawer'
import type { DrawerState, DrawerOnTickCallback, DrawerDebugInfoUnit } from 'experimental/drawer'
import type { VoronoiDiagram } from 'common/voronoi'


type State = DrawerState & {
  step: number,
  rotation: number,
  voronoi: VoronoiDiagram,
  voronoiGraphics: Object,
}

const LLOYD_MAX_STEPS = 1000
const LLOYD_TO_MOVE = 0.1
const DOTS_TOTAL = 100

const initGraphics = (oldState: DrawerState): State => {
  const state = { ...oldState }
  const totalDots = DOTS_TOTAL
  const seed = Date.now()
  random.use(seedrandom(seed))
  const points = U.randomPointsInSquare(totalDots).map(e => ({ x: e.x + state.size / 2, y: e.y + state.size / 2 }))
  state.step = 0
  state.rotation = 0
  state.voronoi = generate(points, state.size, state.size, 0)
  return state
}

const redraw = (state: DrawerState): DrawerState => {
  // add some dynamic lloyd relaxation
  if (state.step >= LLOYD_MAX_STEPS) {
    return rotateGraphics(state)
  }
  state.base_container.removeChildren()
  const voronoi = generate(state.voronoi.cells, state.size, state.size, 1, LLOYD_TO_MOVE)
  return rotateGraphics({
    ...state,
    voronoi,
    step: state.step + 1,
    voronoiGraphics: drawDiagram(state.base_container, voronoi, state.size),
  })
}

const drawDiagram = (parentContainer: Object, voronoi: VoronoiDiagram, size: number): Object => {
  const graphics = new PIXI.Graphics()
  graphics.lineStyle(size / 200, Color.to_pixi([255, 255, 255]), 1)
  parentContainer.addChild(graphics)
  addCircleMask(graphics, parentContainer, size)
  voronoi.cells.forEach(cell => {
    graphics.beginFill(Color.to_pixi([125, 125, 125]), 1)
    cell.nodes.forEach((node, i) => {
      /* eslint-disable-next-line no-unused-expressions */
      i === 0 ? graphics.moveTo(node.x, node.y) : graphics.lineTo(node.x, node.y)
    })
    graphics.closePath()
  })
  return graphics
}

const addCircleMask = (graphics: Object, parentContainer: Object, size: number): void => {
  const mask = new PIXI.Graphics()
  mask.beginFill(Color.to_pixi([255, 255, 255]))
  // FIXME pass coords
  mask.drawCircle(size / 2, size / 2, size / 2)
  mask.endFill()
  /* eslint-disable-next-line no-param-reassign */
  graphics.mask = mask
  parentContainer.addChild(mask)
  const contour = new PIXI.Graphics()
  const contourWidth = size / 200
  contour.lineStyle(contourWidth, Color.to_pixi([255, 255, 255]))
  contour.drawCircle(size / 2, size / 2, size / 2 - contourWidth / 2)
  parentContainer.addChild(contour)
}

const rotateGraphics = (state: State): State => {
  const rotation = state.rotation + Math.PI / 180 / 6
  const voronoiGraphics = state.voronoiGraphics
  voronoiGraphics.pivot = { x: state.voronoi.width / 2, y: state.voronoi.height / 2 }
  voronoiGraphics.x = state.voronoi.width / 2
  voronoiGraphics.y = state.voronoi.height / 2
  voronoiGraphics.rotation = rotation
  return { ...state, rotation }
}

const updateDebugInfo = (state: State): Array<DrawerDebugInfoUnit> => [
  { id: 'step', text: 'lloyd relaxation step (0.1)', value: state.step },
]

export const initVoronoiRotating = (drawerOnTickCallback: DrawerOnTickCallback) => initDrawer(
  // thats because d3.voronoi cant handle negative values!
  'square',
  updateDebugInfo,
  initGraphics,
  redraw,
  drawerOnTickCallback,
)
