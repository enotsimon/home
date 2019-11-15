// @flow
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'
// import * as R from 'ramda'
import * as U from 'common/utils'
import random from 'random'
import seedrandom from 'seedrandom'

import { generate } from 'common/voronoi'
import { initDrawer } from 'experimental/drawer'
import type { DrawerState, DrawerOnTickCallback } from 'experimental/drawer'
import type { VoronoiDiagram } from 'common/voronoi'
import type { ChannelMatrix } from 'common/color'

type State = {|
  ...DrawerState,
  step: number,
  voronoi: VoronoiDiagram,
  voronoiGraphics: Object,
  colorMatrix: ChannelMatrix,
|}

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
  state.voronoi = generate(points, state.size, state.size, 0)
  state.colorMatrix = Color.allChannelMatrixes(1).sort(() => random.float(-1, 1))[0]
  return state
}

const redraw = (state: State): State => {
  // add some dynamic lloyd relaxation
  if (state.step >= LLOYD_MAX_STEPS) {
    return state
  }
  state.base_container.removeChildren()
  // $FlowIgnore FIXME
  const voronoi = generate(state.voronoi.cells, state.size, state.size, 1, LLOYD_TO_MOVE)
  return {
    ...state,
    voronoi,
    step: state.step + 1,
    voronoiGraphics: drawDiagram(state.base_container, voronoi, state.size, state.colorMatrix),
  }
}

const drawDiagram = (parentContainer: Object, voronoi: VoronoiDiagram, size: number, colorMatrix): Object => {
  const graphics = new PIXI.Graphics()
  graphics.lineStyle(size / 200, Color.to_pixi([255, 255, 255]), 1)
  parentContainer.addChild(graphics)
  voronoi.cells.forEach(cell => {
    // TODO its a copy-paste from lloyd_waves_center
    const { r, g, b } = colorMatrix
    const c = U.distance(cell, { x: size / 2, y: size / 2 }) / (size / 2) / 1.4142135623730951
    graphics.beginFill(Color.to_pixi([r - c * r * 4 / 5, g - c * g * 4 / 5, b - c * b * 4 / 5]), 1)
    cell.nodes.forEach((node, i) => {
      /* eslint-disable-next-line no-unused-expressions */
      i === 0 ? graphics.moveTo(node.x, node.y) : graphics.lineTo(node.x, node.y)
    })
    graphics.closePath()
  })
  return graphics
}

const updateDebugInfo = (state: State) => [
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
