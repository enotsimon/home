// @flow
import Util from 'common/util'
import Color from 'common/color'
import * as PIXI from 'pixi.js'

import { createDrawer } from 'experimental/drawer'
import type { DrawerState } from 'experimental/drawer'

type Figure = {
  id: number,
  graphics: Object, // PIXI
  radius: number,
  // rotation_coef: .0025,
  precession_coef: number,
  nutation_coef: number,
}

const updateDebugInfo = (state) => [
  { id: 'debug_info_precession', text: 'precession', value: state.figures ? state.figures[0].precession_coef : '' },
  { id: 'debug_info_nutation', text: 'nutation', value: state.figures ? state.figures[0].nutation_coef : '' },
  { id: 'debug_info_additional', text: 'angle state.acceleration', value: state.acceleration },
]

const initGraphics = (oldState: DrawerState): DrawerState => {
  const state = { ...oldState }
  state.count_figures = 1
  state.figures = [...Array(state.count_figures).keys()].map(i => {
    const graphics = new PIXI.Graphics()
    state.base_container.addChild(graphics)
    return {
      id: i,
      graphics,
      radius: 0.9 * 0.5 * state.size,
      // rotation_coef: .0025,
      precession_coef: 0.0025 * Util.rand_float(-3, 3),
      nutation_coef: 0.0025 * Util.rand_float(1, 3),
    }
  })
  return state
}

const redraw = (oldState: DrawerState): DrawerState => {
  const state = { ...oldState }
  state.acceleration = 5 * Math.cos(0.005 * state.tickTime)
  state.figures.forEach(figure => drawFullCircle(figure, state))
  return state
}

const drawFullCircle = (figure: Figure, state: DrawerState): void => {
  figure.graphics.clear()
  const count_dots = 2 * 36
  for (let angle = 0; angle <= 2 * Math.PI; angle += 2 * Math.PI / count_dots) {
    const coords = calcSinglePoint(
      figure.radius,
      // angle + (figure.rotation_coef * state.tickTime) + state.acceleration,
      // i dont understand why its really state.acceleration and where is the speed?
      angle + state.acceleration,
      figure.precession_coef * state.tickTime,
      figure.nutation_coef * state.tickTime + 0.5 * state.acceleration
    )
    figure.graphics.beginFill(Color.to_pixi([255, 255, 255]))
    figure.graphics.drawCircle(coords.x, coords.y, 1)
    figure.graphics.endFill()
  }
}

const calcSinglePoint = (radius, angle, precession, nutation) => {
  const x = radius * Math.cos(angle) * Math.sin(nutation)
  const y = radius * Math.sin(angle)
  const sp = Math.sin(precession)
  const cp = Math.cos(precession)
  const nx = x * cp - y * sp
  const ny = x * sp + y * cp
  return { x: nx, y: ny }
}

createDrawer(
  'circle',
  updateDebugInfo,
  initGraphics,
  redraw,
)
