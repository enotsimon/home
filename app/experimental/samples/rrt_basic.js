// @flow
import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'

import * as Color from 'common/color'
import * as U from 'common/utils'
import { addCircleMask } from 'experimental/drawing_functions'
import { initDrawer } from 'experimental/drawer'
import { generate } from 'common/rrt_diagram'

import type { DrawerState, DrawerOnTickCallback } from 'experimental/drawer'
import type { RRTDiagram, RRTPoint } from 'common/rrt_diagram'

const STEP = 5

type State = {|
  ...DrawerState,
  rrt: RRTDiagram,
  graphics: Object,
  curIndex: number,
|}

const initGraphics = (state: State): State => {
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.base_container.removeChildren()
  const graphics = new PIXI.Graphics()
  state.base_container.addChild(graphics)
  addCircleMask(graphics, state.size / 2, { x: 0, y: 0 }, [100, 0, 0])
  const rrt = generate(
    STEP,
    () => {
      const newPointPolar = U.randomPointPolar(state.size / 2)
      return U.fromPolarCoords(newPointPolar.angle, newPointPolar.radius)
    },
    { x: 0, y: state.size / 2 }
  )
  return {
    ...state,
    graphics,
    rrt,
    curIndex: 1, // 1 because we dont draw root point! be careful! _we dont draw root point_!!!
  }
}

const redraw = (state: State): State => {
  const point = state.rrt[state.curIndex]
  if (!point) {
    // end of diagram
    return initGraphics(state)
  }
  if (!point.parent) {
    console.log('call to drawing root point which is not allowed!')
    return { ...state, curIndex: state.curIndex + 1 }
  }
  const parent = state.rrt[point.parent]
  drawCircleAndLine(state.graphics, point, parent)
  return { ...state, curIndex: state.curIndex + 1 }
}

const drawCircleAndLine = (graphics: Object, point: RRTPoint, parent: RRTPoint): void => {
  const pointColor = Math.max(50, 255 - (point.index / 3))
  const lineColor = Math.max(10, pointColor / 2)
  const lineWidth = Math.max(0.5, 2 - (point.index / 250))
  graphics.beginFill(Color.to_pixi([pointColor, 0, 0]), 1)
  graphics.drawCircle(point.x, point.y, 0.5)
  graphics.endFill()
  graphics.lineStyle(lineWidth, Color.to_pixi([lineColor, 0, 0]), 0.5)
  graphics.moveTo(parent.x, parent.y)
  graphics.lineTo(point.x, point.y)
}

export const init = (drawerOnTickCallback: DrawerOnTickCallback) => initDrawer(
  'circle',
  () => [],
  initGraphics,
  redraw,
  drawerOnTickCallback,
)
