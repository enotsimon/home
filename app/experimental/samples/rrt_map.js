// @flow
/**
 * попробуем возродить идею карты из rrt
 * rrt это горные хребты
 */
import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'
import * as R from 'ramda'
import * as Color from 'common/color'

import * as U from 'common/utils'
// import { addCircleMask } from 'experimental/drawing_functions'
import { drawRRTPoint, drawRRTLink } from 'experimental/drawing_functions'
import { startDrawer } from 'experimental/drawer'
import { generate, calcHeight } from 'common/rrt_diagram'
import { generate as generateVoronoi } from 'common/voronoi'
import { randomPointPolar } from 'experimental/random_points'

import type { DrawerState } from 'experimental/drawer'
import type { RRTWDDiagram, RRTWDPoint } from 'common/rrt_diagram'
import type { VoronoiDiagram, VoronoiCell } from 'common/voronoi'
import type { RGBArray } from 'common/color'

const STEP = 5
const COLOR_MAX = [0, 255, 0]
const COLOR_MIN = [0, 25, 0]
const DEPTH_DRAW_COLOR = [0, 0, 0]
const DEPTH_DRAW_THRESHOLD = 1
const DRAW_RRT_ALPHA = 1
const DRAW_VORONOI_ALPHA = 0
const REDRAW_STEP = 500

type State = {|
  ...DrawerState,
  rrt: RRTWDDiagram,
  pointsGraphics: Object,
  linksGraphics: Object,
|}

const initAll = (state: State): State => {
  const size = state.size / 2
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.base_container.removeChildren()
  // order emulates z-index!
  // addCircleMask(state.base_container, width, { x: 0, y: 0 }, COLOR_MIN)
  const voronoiGraphics = new PIXI.Graphics()
  state.base_container.addChild(voronoiGraphics)
  const linksGraphics = new PIXI.Graphics()
  state.base_container.addChild(linksGraphics)
  const pointsGraphics = new PIXI.Graphics()
  state.base_container.addChild(pointsGraphics)

  // const root = { x: 0, y: 0 }
  const root = randomPointFunc(size)()
  const rrt = generate(STEP, randomPointFunc(size), [root])
  console.log('cnt points', rrt.length)

  const rrtWithHeight = calcHeight(rrt)
  // console.log('RRT', rrtWithHeight[0])
  const newState = { ...state, rrt: rrtWithHeight, pointsGraphics, linksGraphics }

  const heightMax = calcHeightMax(rrtWithHeight)
  console.log('heightMax', heightMax, 'draw threshold', DEPTH_DRAW_THRESHOLD)
  drawRRT(newState, heightMax, DRAW_RRT_ALPHA)

  const voronoi = generateVoronoi(rrtWithHeight, size, size, 0, 1, -size, -size)
  const voronoiCellColor = point => calcColor(point.height, heightMax)
  drawVoronoiDiagram(voronoiGraphics, voronoi, 0.5, [0, 0, 0], voronoiCellColor, DRAW_VORONOI_ALPHA)

  // const lowHeight

  return newState
}

const randomPointFunc = (radius: number) => () => U.fromPolarCoords(randomPointPolar(radius))

const calcColor = (height, heightMax): RGBArray => {
  // experimental
  if (height < DEPTH_DRAW_THRESHOLD) {
    return DEPTH_DRAW_COLOR
  }
  // $FlowIgnore hes wrong
  return R.map(i => U.normalizeValue(height, heightMax, COLOR_MAX[i], 0, COLOR_MIN[i]), [0, 1, 2])
}

// TODO move to drawing functions
const drawVoronoiDiagram = (
  graphics: Object,
  voronoi: VoronoiDiagram<RRTWDPoint>,
  contourWidth: number,
  contourColor: RGBArray,
  cellColorFunc: (cell: VoronoiCell<RRTWDPoint>) => RGBArray,
  cellAlpha: number,
): void => {
  // const graphics = new PIXI.Graphics()
  graphics.lineStyle(contourWidth, Color.to_pixi(contourColor), 1)
  // parentContainer.addChild(graphics)
  voronoi.cells.forEach(cell => {
    const color = cellColorFunc(cell)
    graphics.beginFill(Color.to_pixi(color), cellAlpha)
    cell.nodes.forEach((node, i) => {
      /* eslint-disable-next-line no-unused-expressions */
      i === 0 ? graphics.moveTo(node.x, node.y) : graphics.lineTo(node.x, node.y)
    })
    graphics.closePath()
  })
}

const calcHeightMax = rrt => R.reduce((acc, { height }) => (acc > height ? acc : height), 0, rrt)

const drawRRT = ({ rrt, pointsGraphics, linksGraphics }: State, heightMax, alpha): void => {
  // const generationMax = R.reduce((acc, { generation }) => (acc > generation ? acc : generation), 0, rrt)
  rrt.forEach(point => {
    // $FlowIgnore he is wrong. number is 3
    const color: RGBArray = calcColor(point.height, heightMax)
    if (point.parent !== null && point.parent !== undefined) {
      const parentHeight = rrt[point.parent].height
      // когда у parent height меньше чем у текущей точки тогда цвет связи выглядит неадекватно ярким
      // что воспринимается как баг подсчета height
      const linkColor = parentHeight < point.height ? calcColor(parentHeight, heightMax) : color
      drawRRTLink(linksGraphics, point, rrt[point.parent], linkColor, 1, alpha)
    }
    const cntLinks = point.children.length + (point.parent ? 1 : 0)
    if (cntLinks >= 3) {
      // color = [125, 0, 0]
    }
    drawRRTPoint(pointsGraphics, point, color, [0, 0, 0], 1, alpha)
  })
}

const initGraphics = (state: State): State => {
  return initAll(state)
}

const redraw = (state: State): State => {
  if (state.ticks % REDRAW_STEP === 1) {
    // return initAll(state)
  }
  return state
}

export const init = (): void => startDrawer('circle', initGraphics, redraw)
