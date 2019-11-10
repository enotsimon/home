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
  voronoi: VoronoiDiagram,
}

const LLOYD_MAX_STEPS = 100

const initGraphics = (oldState: DrawerState): State => {
  const state = { ...oldState }
  const totalDots = 100
  const seed = Date.now()
  random.use(seedrandom(seed))
  const points = randomPointsPolarNaive(state.size / 2, totalDots)
  state.step = 0
  state.voronoi = generate(points, state.size, state.size, 0)
  drawDiagram(state.base_container, state.voronoi)
  return state
}

const redraw = (state: DrawerState): DrawerState => {
  // add some dynamic lloyd relaxation
  if (state.step >= LLOYD_MAX_STEPS) {
    return state
  }
  state.base_container.removeChildren()
  const newState = {
    ...state,
    voronoi: generate(state.voronoi.cells, state.size, state.size, 1),
    step: state.step + 1,
  }
  drawDiagram(newState.base_container, newState.voronoi)
  return newState
}

const randomPointsPolarNaive = (scale: number, limit: number): Array<XYPoint> => R.map(() => {
  const angle = random.float(0, 2 * Math.PI)
  const radius = random.float(0, scale)
  const { x, y } = U.fromPolarCoords(angle, radius)
  // x and y from 0 to 2 scale. thats because d3.voronoi cant handle negative values!
  return { x: x + scale, y: y + scale }
})(R.range(0, limit))

const drawDiagram = (parentContainer: Object, voronoi: VoronoiDiagram): void => {
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
}


export const initVoronoi = (drawerOnTickCallback: DrawerOnTickCallback) => initDrawer(
  // thats because d3.voronoi cant handle negative values!
  'square',
  () => [],
  initGraphics,
  redraw,
  drawerOnTickCallback,
)
