// @flow
import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'

import * as U from 'enot-simon-utils/lib/utils'
import { addCircleMask, drawRRTPoint, drawRRTLink } from 'experimental/drawing_functions'
import { startDrawer } from 'experimental/drawer'
import { generate } from 'common/rrt_diagram'
import { randomPointPolar } from 'experimental/random_points'

import type { DrawerState } from 'experimental/drawer'
import type { RRTDiagram } from 'common/rrt_diagram'

const STEP = 5

type State = {|
  ...DrawerState,
  rrt: RRTDiagram,
  pointsGraphics: Object,
  linksGraphics: Object,
  curIndex: number,
|}

const initGraphics = (state: State): State => {
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.base_container.removeChildren()
  // order emulates z-index!
  const linksGraphics = new PIXI.Graphics()
  state.base_container.addChild(linksGraphics)
  const pointsGraphics = new PIXI.Graphics()
  state.base_container.addChild(pointsGraphics)
  addCircleMask(state.base_container, state.size / 2, { x: 0, y: 0 }, [100, 0, 0])
  const rrt = generate(STEP, randomPointFunc(state.size / 2), [{ x: 0, y: state.size / 2 }])
  console.log('cnt points', rrt.length)
  return {
    ...state,
    pointsGraphics,
    linksGraphics,
    rrt,
    curIndex: 1, // 1 because we dont draw root point! be careful! _we dont draw root point_!!!
  }
}

const randomPointFunc = (radius: number) => () => U.fromPolarCoords(randomPointPolar(radius))

const redraw = (state: State): State => {
  const point = state.rrt[state.curIndex]
  if (!point) {
    // end of diagram
    return initGraphics(state)
  }
  if (point.parent === null || point.parent === undefined) {
    console.log('WARNING! call to drawing root point which is not allowed!', point)
    return { ...state, curIndex: state.curIndex + 1 }
  }
  const parent = state.rrt[point.parent]
  // const mainColor = Math.max(50, 255 - (point.index / 3))
  const mainColor = 255 - U.normalizeValue(point.index, state.rrt.length, 255, 0, 50)
  const bgColor = mainColor / 2
  const radius = Math.max(0.5, 2 - (3 * point.index / state.rrt.length))
  // yes bgColor and mainColor are mixed
  drawRRTPoint(state.pointsGraphics, point, [bgColor, 0, 0], [mainColor, 0, 0], radius / 1.25)
  drawRRTLink(state.linksGraphics, point, parent, [bgColor, 0, 0], radius, 0.5)
  return { ...state, curIndex: state.curIndex + 1 }
}

export const init = (): void => startDrawer('circle', initGraphics, redraw)
