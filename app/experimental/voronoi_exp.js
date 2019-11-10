// @flow
import Color from 'common/color'
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import * as U from 'common/utils'
import random from 'random'
import seedrandom from 'seedrandom'

import { generate } from 'common/voronoi'
import { initDrawer } from 'experimental/drawer'
import type { DrawerState, DrawerOnTickCallback } from 'experimental/drawer'
import type { XYPoint } from 'common/utils'
import type { VoronoiDiagram } from 'common/voronoi'


type State = DrawerState & {
  step: number,
  rotation: number,
  voronoi: VoronoiDiagram,
  voronoiGraphics: Object,
}

const LLOYD_MAX_STEPS = 100

const initGraphics = (oldState: DrawerState): State => {
  const state = { ...oldState }
  const totalDots = 100
  const seed = Date.now()
  random.use(seedrandom(seed))
  const points = randomPointsInSquare(totalDots).map(e => ({ x: e.x + state.size / 2, y: e.y + state.size / 2 }))
  state.step = 0
  state.rotation = 0
  state.voronoi = generate(points, state.size, state.size, 0)
  drawDiagram(state.base_container, state.voronoi)
  return state
}

const redraw = (state: DrawerState): DrawerState => {
  // add some dynamic lloyd relaxation
  if (state.step >= LLOYD_MAX_STEPS) {
    return rotateGraphics(state)
  }
  state.base_container.removeChildren()
  const voronoi = generate(state.voronoi.cells, state.size, state.size, 1)
  return rotateGraphics({
    ...state,
    voronoi,
    step: state.step + 1,
    voronoiGraphics: drawDiagram(state.base_container, voronoi),
  })
}

// not used from now exported just to prevent eslint errors
export const randomPointsPolarNaive = (scale: number, count: number): Array<XYPoint> => R.map(() => {
  const angle = random.float(0, 2 * Math.PI)
  const radius = random.float(0, scale)
  const { x, y } = U.fromPolarCoords(angle, radius)
  // x and y from 0 to 2 scale. thats because d3.voronoi cant handle negative values!
  return { x: x + scale, y: y + scale }
})(R.range(0, count))

const randomPointsInSquare = (count: number): Array<XYPoint> => R.map(() => {
  return { x: random.float(), y: random.float() }
})(R.range(0, count))

const drawDiagram = (parentContainer: Object, voronoi: VoronoiDiagram): Object => {
  const graphics = new PIXI.Graphics()
  graphics.lineStyle(0.5, Color.to_pixi([255, 255, 255]), 1)
  parentContainer.addChild(graphics)
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

const rotateGraphics = (state: State): State => {
  const rotation = state.rotation + Math.PI / 180 / 4
  const voronoiGraphics = state.voronoiGraphics
  voronoiGraphics.pivot = { x: state.voronoi.width / 2, y: state.voronoi.height / 2 }
  voronoiGraphics.x = state.voronoi.width / 2
  voronoiGraphics.y = state.voronoi.height / 2
  voronoiGraphics.rotation = rotation
  return { ...state, rotation }
}


export const initVoronoiRotating = (drawerOnTickCallback: DrawerOnTickCallback) => initDrawer(
  // thats because d3.voronoi cant handle negative values!
  'square',
  () => [],
  initGraphics,
  redraw,
  drawerOnTickCallback,
)
