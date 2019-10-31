// @flow
import Color from 'common/color'
import * as d3 from 'd3'
import App from 'experimental/components/app'
import ReactDOM from 'react-dom'
import React from 'react'
import * as PIXI from 'pixi.js'

export type DrawerRegime = 'square' | 'circle'

export type DrawerState = {
  ticks: number,
  tickTime: number,
  size: number,
  tick_delta: number,
  base_container: Object, // TODO
  // TODO split callbacks state and drawer state
  [string]: any,
}

export type DrawerDebugInfoUnit = {
  id: string,
  text: string,
  value: string | number,
}

export type DrawerNewStateCallback = (DrawerState) => DrawerState

const initDrawer = (
  regime: DrawerRegime,
  updateDebugInfo: DrawerState => Array<DrawerDebugInfoUnit>,
  initGraphics: DrawerNewStateCallback,
  redraw: DrawerNewStateCallback,
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
    view: document.getElementById('view'), // TODO create it
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

  const mouse_move_handler = event => {
    if (event.target !== pixi.view) {
      return false
    }
    const mouse_coords = { x: event.offsetX, y: event.offsetY }
    d3.select('#mouse_pos').html(`{x: ${mouse_coords.x}, y: ${mouse_coords.y}}`)
  }

  pixi.stage.addChild(state.base_container)
  // $FlowIgnore
  document.getElementById('view_container').appendChild(pixi.view)
  // $FlowIgnore
  document.addEventListener('mousemove', mouse_move_handler.bind(this), false)

  state = initGraphics(state)

  pixi.ticker.add(delta => {
    state.ticks += 1
    if (state.ticks % 10 === 0) {
      d3.select('#fps_counter').html(pixi.ticker.FPS || 0)
      // $FlowIgnore
      // FIXME
      // updateDebugInfo(state).forEach(e => { document.getElementById(e.id).innerHTML = e.value })
    }
    state.tick_delta = delta
    state.tickTime += delta
    state = redraw(state)
  })

  // it was, but not sure if needed
  // const clear_all = () => state.base_container.removeChildren()
}

export const createDrawer = (
  regime: DrawerRegime,
  updateDebugInfo: DrawerState => Array<DrawerDebugInfoUnit>,
  initGraphics: DrawerNewStateCallback,
  redraw: DrawerNewStateCallback,
): void => {
  // TODO move it from here??? bad place
  const app = React.createElement(App, { additional: [] })
  document.addEventListener('DOMContentLoaded', () => {
    // $FlowIgnore
    ReactDOM.render(app, document.querySelector('#app')) // TODO create it
    initDrawer(regime, updateDebugInfo, initGraphics, redraw)
  })
}
