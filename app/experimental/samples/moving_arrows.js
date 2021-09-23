// @flow
import Util from 'common/util'
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'

import { startDrawer } from 'experimental/drawer'
import type { DrawerState } from 'experimental/drawer'

// TODO:
//   - add debug info of angle_inc, acceleration, speed
//   - zooming with speed change? tried, looks bad
//   - fix graphics redraw leaps!!!

// TODO flow type State

const initGraphics = (oldState: DrawerState): DrawerState => {
  const state = { ...oldState }
  state.size_coef = 7
  state.step = state.size / state.size_coef
  state.matrix_size = 2 * state.size
  state.arrows = []
  state.change_angle_base_threshold = 100
  state.change_angle_tick = state.change_angle_base_threshold
  state.angle = 2 * Math.PI * Math.random()
  state.angle_inc = 0
  state.angle_inc_max = 2 * Math.PI / 360
  state.acceleration = 0
  state.max_speed = 1.2
  state.min_speed = 0.6
  state.speed = (state.max_speed - state.min_speed) / 2
  state.color = [255, 255, 255]
  state.matrix_container = new PIXI.Container()
  state.matrix_container.x = -state.step
  state.matrix_container.y = -state.step
  state.base_container.addChild(state.matrix_container)

  for (let y = -2 * state.step; y < state.matrix_size; y += state.step) {
    for (let x = -2 * state.step; x < state.matrix_size; x += state.step) {
      // git very bad quality on big scales, so we have to set it small and big font size
      const size = state.step * 9
      const arrow = new PIXI.Text('➔', { fontFamily: 'Arial', fontSize: size, fill: Color.to_pixi(state.color) })
      arrow.scale = { x: 0.1, y: 0.1 }
      arrow.x = x
      arrow.y = y
      arrow.rotation = state.angle
      state.arrows = [...state.arrows, arrow]
    }
  }
  state.arrows.forEach(arrow => state.matrix_container.addChild(arrow))
  return state
}

const redraw = (oldState: DrawerState): DrawerState => {
  const state = { ...oldState }
  state.change_angle_tick -= 1
  if (state.change_angle_tick <= 0) {
    state.change_angle_tick = state.change_angle_base_threshold * (3 * Math.random() + 0.2) || 0
    const rand_angle = linearInterpolation(-state.angle_inc_max, state.angle_inc_max, Math.random())
    // turn and go straight
    state.angle_inc = state.angle_inc ? 0 : rand_angle
  }
  state.angle += state.angle_inc
  // TODO its very bad that speed depends totally on angle
  const acceleration = state.angle_inc_max / 2 - Math.abs(state.angle_inc)
  let new_speed = state.speed + acceleration
  new_speed *= state.tick_delta
  state.speed = Math.max(state.min_speed, Math.min(new_speed, state.max_speed))

  const radius = state.speed
  const angle = state.angle
  const diff = Util.from_polar_coords(angle, radius)
  state.arrows.forEach(arrow => {
    // TODO seems too complicated. is there better way?
    // FIXME cant just rewrite it to map and { ...arrow } cause it is PIXI obj and its broken after clone
    /* eslint-disable no-param-reassign */
    arrow.x = ((arrow.x + diff.x) % state.matrix_size) + (arrow.x < 0 ? state.matrix_size : 0)
    arrow.y = ((arrow.y + diff.y) % state.matrix_size) + (arrow.y < 0 ? state.matrix_size : 0)
    arrow.rotation = state.angle
  })
  return state
}

// took it from http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
// russian https://habrahabr.ru/post/142592/
/*
const cosInterpolation = (min: number, max: number, x: number): number => {
  const f = (1 - Math.cos(Math.PI * x)) * 0.5
  return min * (1 - f) + max * f
}
*/

const linearInterpolation = (min: number, max: number, x: number): number => {
  return min * (1 - x) + max * x
}

export const initMovingArrows = (): void => startDrawer('square', initGraphics, redraw)
