// @flow
import Util from 'common/util'
import * as Color from 'enot-simon-utils/lib/color'
import * as PIXI from 'pixi.js'
import * as d3 from 'd3'
import * as R from 'ramda'

import { startDrawer } from 'experimental/drawer'
import type { DrawerState } from 'experimental/drawer'

type StellarBody = {
  base_container: Object,
  graphics: Object,
  name: string,
  parent: ?StellarBody,
  orbital_radius: number,
  radius: number,
  orbital_speed: number,
  rotation_speed: number,
  orbital_angle: number,
  angle: number,
}

type State = {|
  ...DrawerState,
  star: StellarBody,
  planet1: StellarBody,
  // TODO
|}


const initGraphics = (oldState: State): State => {
  let state = { ...oldState }
  state.matrix = new PIXI.Container()
  state.base_container.addChild(state.matrix)
  // init bodies
  state.star = initBody(state, 'star', null, 0, 10, 0, 0.5)
  state.planet1 = initBody(state, 'planet1', state.star, 20, 3, 1, 0)
  state.moon1 = initBody(state, 'moon1', state.planet1, 6, 1, 2, 2)
  state.planet2 = initBody(state, 'planet2', state.star, 40, 5, 2, 3)
  state.moon21 = initBody(state, 'moon21', state.planet2, 8, 2, 3, 0.1)
  state.moon22 = initBody(state, 'moon22', state.planet2, 12, 1, 4, 1)
  state.bodies = [state.star, state.planet1, state.moon1, state.planet2, state.moon21, state.moon22]
  state.forced_focus = false
  state.focused_body = state.bodies[0]
  state.focus_change_threshold = 300
  state.focus_change_tick = state.focus_change_threshold
  state = updateMatrixByFocus(state)
  return state
}

const redraw = (oldState: DrawerState): DrawerState => {
  let state = { ...oldState }
  state.bodies = state.bodies.map(origBody => {
    const body = { ...origBody }
    body.orbital_angle += state.tick_delta * body.orbital_speed
    body.angle += state.tick_delta * (body.orbital_speed + body.rotation_speed)
    return setGraphicsTransformByStellarCoords(body)
  })
  state.focus_change_tick -= 1
  if (state.focus_change_tick <= 0) {
    state.focus_change_tick = state.focus_change_threshold
    if (!state.forced_focus) {
      const cur_index = findIndexOfFocusedBody(state.focused_body)(state.bodies)
      state.focused_body = state.bodies[cur_index === state.bodies.length - 1 ? 0 : cur_index + 1]
      console.log('now focus on', state.focused_body.name)
    }
  }
  state = updateMatrixByFocus(state)
  d3.select('#debug_info_focus_on').html(state.focused_body.name)
  return state
}

const findIndexOfFocusedBody = (focused_body) => R.findIndex(body => body.name === focused_body.name)

const updateMatrixByFocus = (oldState: DrawerState): DrawerState => {
  const state = { ...oldState }
  // TODO do it second time on each frame, bad
  const coords = calc_coords_recursively(state.focused_body)
  state.matrix.position.x = -coords.x
  state.matrix.position.y = -coords.y
  return state
}

const calc_coords_recursively = (body, acc = { x: 0, y: 0 }) => {
  const coords = Util.from_polar_coords(body.orbital_angle, body.orbital_radius)
  acc.x += coords.x
  acc.y += coords.y
  if (body.parent) {
    return calc_coords_recursively(body.parent, acc)
  }
  return acc
}

const initBody = (state, name, parent, orbital_radius, radius, orbital_speed, rotation_speed): StellarBody => {
  const radius_factor = 1.5 // DEBUG!!!
  const orbital_angle = false
  const angle = false
  const BodyRadius = radius_factor * radius

  //
  // thats because base_container do not rotate with planet rotation, otherwise
  // all moons rotate with planet's self rotations
  const base_container = new PIXI.Graphics()
  const graphics = new PIXI.Graphics()
  base_container.addChild(graphics)
  graphics.lineStyle(BodyRadius / 10, Color.to_pixi([255, 255, 255]))
  graphics.drawCircle(0, 0, BodyRadius)
  graphics.closePath();
  ([1, 2, 3]).forEach(i => {
    const coords = Util.from_polar_coords(i * 2 * Math.PI / 3, BodyRadius / 2)
    graphics.drawCircle(coords.x, coords.y, BodyRadius / 4)
    graphics.closePath()
  })
  //

  let body = {
    base_container,
    graphics,
    name,
    parent,
    orbital_radius: radius_factor * orbital_radius,
    radius: BodyRadius,
    orbital_speed: Util.radians(orbital_speed),
    rotation_speed: Util.radians(rotation_speed),
    orbital_angle: orbital_angle || 2 * Math.PI * Math.random(),
    angle: angle || 2 * Math.PI * Math.random(),
  }
  body = setGraphicsTransformByStellarCoords(body)
  const parent_graphics = parent ? parent.base_container : state.matrix
  parent_graphics.addChild(body.base_container)
  return body
}

const setGraphicsTransformByStellarCoords = (origBody: StellarBody): StellarBody => {
  const body = { ...origBody }
  const coords = Util.from_polar_coords(body.orbital_angle, body.orbital_radius)
  // thats not a mistake, see comment below
  body.base_container.x = coords.x
  body.base_container.y = coords.y
  body.graphics.rotation = body.angle
  return body
}

export const initPlanetFocus = (): void => startDrawer('circle', initGraphics, redraw)
