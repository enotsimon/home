// @flow
import Util from 'common/util'
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'

import { startDrawer } from 'experimental/drawer'

import type { DrawerState } from 'experimental/drawer'

export type PlanetXYZPoint = { x: number, y: number, z: number }
export type PlanetSpherePoint = { phi: number, theta: number }
export type PlanetSpherePointWG = PlanetSpherePoint & { graphics: Object }
export type SphereMapBuilder = (state: DrawerState) => Array<PlanetSpherePoint>

export type PlanetState = {|
  ...DrawerState,
  planet: Object, // FIXME PIXI
  radius: number,
  rotation: number,
  precession: number,
  nutation: number,
  points: Array<PlanetSpherePointWG>,
  map_transparency_alpha: number,
  draw_contour: boolean,
|}

export const calcSinglePoint = (
  radius: number,
  phi: number,
  theta: number,
  rotation: number,
  precession: number,
  nutation: number
): PlanetXYZPoint => {
  const x1 = radius * Math.cos(phi) * Math.sin(theta)
  const y1 = radius * Math.sin(phi) * Math.sin(theta)
  const z1 = radius * Math.cos(theta)
  const sinR = Math.sin(rotation)
  const cosR = Math.cos(rotation)
  const sinP = Math.sin(precession)
  const cosP = Math.cos(precession)
  const sinN = Math.sin(nutation)
  const cosN = Math.cos(nutation)
  const x = x1 * (cosP * cosR - sinP * cosN * sinR) + y1 * (-cosP * sinR - sinP * cosN * cosR) + z1 * (sinP * sinN)
  const y = x1 * (sinP * cosR + cosP * cosN * sinR) + y1 * (-sinP * sinR + cosP * cosN * cosR) + z1 * (-cosP * sinN)
  const z = x1 * (sinN * sinR) + y1 * (sinN * cosR) + z1 * cosN
  return { x, y, z }
}

export const initPlanetDrawer = (
  sphereMap: SphereMapBuilder = defaultSphereMap,
  mapTransparency: number = 0.25,
): void => startDrawer('circle', state => initGraphics(state, sphereMap, mapTransparency), redraw)

// TODO -- move it out from here or just delete
const defaultSphereMap: SphereMapBuilder = () => {
  return [...Array(500).keys()].map(() => {
    return {
      phi: Util.rand_float(0, 2 * Math.PI),
      theta: Util.rand_float(0, 2 * Math.PI),
    }
  })
}

const initGraphicsFromSphereMap = (sphereMapData: Array<PlanetSpherePoint>, state): Array<PlanetSpherePointWG> => {
  return sphereMapData.map(spherePoint => {
    const e = { ...spherePoint, graphics: new PIXI.Graphics() }
    e.graphics.beginFill(Color.to_pixi([255, 255, 255]), 1)
    e.graphics.drawRect(0, 0, 0.0025 * state.size, 0.0025 * state.size)
    e.graphics.endFill()
    state.planet.addChild(e.graphics)
    return e
  })
}

const initGraphics = (oldState: DrawerState, sphereMap: SphereMapBuilder, mapTransparency: number): PlanetState => {
  const state = { ...oldState }
  state.planet = new PIXI.Container()
  state.base_container.addChild(state.planet)
  state.radius = 0.9 * 0.5 * state.size
  state.rotation = null
  state.precession = null
  state.nutation = null
  state.map_transparency_alpha = mapTransparency
  state.draw_contour = true
  state.points = initGraphicsFromSphereMap(sphereMap(state), state)
  if (state.draw_contour) {
    const contour = new PIXI.Graphics()
    contour.lineStyle(1, Color.to_pixi([255, 255, 255]))
    contour.drawCircle(0, 0, state.radius)
    state.base_container.addChild(contour)
  }
  return state
}

const redraw = (oldState: PlanetState): PlanetState => {
  const state = { ...oldState }
  // here was function change_angles(state.ticks)
  state.rotation = Util.radians(0) + state.ticks * (2 * Math.PI / 360)
  state.precession = Util.radians(30) + Util.radians(15) * Math.sin(2 * state.ticks / 360)
  state.nutation = Util.radians(90 - 30) + Util.radians(15) * Math.cos(2 * state.ticks / 360)
  //
  state.points.forEach(point => {
    const coords = calcSinglePoint(
      state.radius,
      point.phi,
      point.theta,
      state.rotation,
      state.precession,
      state.nutation
    )
    /* eslint-disable no-param-reassign */
    point.graphics.alpha = coords.z < 0 ? state.map_transparency_alpha : 1
    point.graphics.x = coords.x
    point.graphics.y = coords.y
  })
  return state
}
