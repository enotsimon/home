// @flow
import Color from 'common/color'
import * as PIXI from 'pixi.js'

export type DrawerRegime = 'square' | 'circle'

export type DrawerState = {|
  ticks: number,
  tickTime: number,
  size: number,
  tick_delta: number,
  base_container: Object, // TODO
  // TODO split callbacks state and drawer state
  [string]: any,
|}

export type ExtDrawerState<T: Object> = {| ...DrawerState, ...T |}

// TODO remove id
export type DrawerDebugInfoUnit = {|
  text: string,
  value: string | number,
|}

export type DrawerOnTickCallback = (fps: number, delta: number, debugInfo: Array<DrawerDebugInfoUnit>) => void

export type DrawerDebugInfoCallback<T: Object> = (ExtDrawerState<T>) => Array<DrawerDebugInfoUnit>
export type DrawerInitCallback<T: Object> = (DrawerState) => ExtDrawerState<T>
export type DrawerRedrawCallback<T: Object> = (ExtDrawerState<T>) => ExtDrawerState<T>

const BASIC_TICK_THROTTLE = 10

export const initDrawer = <T: Object>(
  regime: DrawerRegime,
  updateDebugInfo: DrawerDebugInfoCallback<T>,
  initGraphics: DrawerInitCallback<T>,
  redraw: DrawerRedrawCallback<T>,
  onTickCallback: DrawerOnTickCallback,
): void => {
  let state = {
    ticks: 0,
    tickTime: 0,
    base_container: new PIXI.Container(), // TODO camel
    size: 0,
    tick_delta: 0,
  }
  const realSize = 800
  const pixi = new PIXI.Application(realSize, realSize, {
    backgroundColor: Color.to_pixi([0, 0, 0]),
    antialias: true,
    view: document.getElementById('view'), // TODO looks bad
  })
  pixi.stage.interactive = true // ??
  console.log('renderer', pixi.renderer)

  if (regime === 'square') {
    // square map is 100x100 size
    state.size = 100
    const scale = (realSize / state.size) || 0
    state.base_container.scale = { x: scale, y: scale }
  } else if (regime === 'circle') {
    // circle map is circle with radils=100, coords from -100 to 100
    state.size = 200
    const scale = (realSize / state.size) || 0
    state.base_container.scale = { x: scale, y: scale }
    state.base_container.position.x = (realSize / 2) || 0
    state.base_container.position.y = (realSize / 2) || 0
  } else {
    throw (`unknown regime: ${regime}`)
  }

  pixi.stage.addChild(state.base_container)

  state = initGraphics(state)

  pixi.ticker.add(delta => {
    state.ticks += 1
    if (state.ticks % BASIC_TICK_THROTTLE === 0) {
      // $FlowIgnore FIXME dont understand whats wrong
      onTickCallback(pixi.ticker.FPS, delta, updateDebugInfo(state))
    }
    state.tick_delta = delta
    state.tickTime += delta
    // $FlowIgnore FIXME dont understand whats wrong
    state = redraw(state)
  })
}
