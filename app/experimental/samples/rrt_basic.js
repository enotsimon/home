// @flow
import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'

import * as Color from 'common/color'
import * as U from 'common/utils'
import { addCircleMask } from 'experimental/drawing_functions'
import { startDrawer } from 'experimental/drawer'
import { generate } from 'common/rrt_diagram'
import { randomPointPolar } from 'experimental/random_points'

import type { DrawerState } from 'experimental/drawer'
import type { RRTDiagram, RRTPoint } from 'common/rrt_diagram'

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
  const rrt = generate(STEP, randomPointFunc(state.size / 2), { x: 0, y: state.size / 2 })
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
  const mainColor = Math.max(50, 255 - (point.index / 3))
  const radius = Math.max(0.5, 2 - (point.index / 250))
  const bgColor = Math.max(10, mainColor / 2)
  drawPoint(state.pointsGraphics, point, mainColor, bgColor, radius)
  drawLink(state.linksGraphics, point, parent, bgColor, radius)
  return { ...state, curIndex: state.curIndex + 1 }
}

const drawPoint = (graphics: Object, point: RRTPoint, mainColor, bgColor, radius): void => {
  graphics.beginFill(Color.to_pixi([bgColor, 0, 0]), 1)
  graphics.drawCircle(point.x, point.y, radius / 1.25)
  graphics.endFill()
  graphics.beginFill(Color.to_pixi([mainColor, 0, 0]), 1)
  graphics.drawCircle(point.x, point.y, radius / 3)
  graphics.endFill()
}

const drawLink = (graphics: Object, point: RRTPoint, parent: RRTPoint, bgColor, radius): void => {
  graphics.lineStyle(radius, Color.to_pixi([bgColor, 0, 0]), 0.5)
  graphics.moveTo(parent.x, parent.y)
  graphics.lineTo(point.x, point.y)
}

export const init = (): void => startDrawer('circle', initGraphics, redraw)
