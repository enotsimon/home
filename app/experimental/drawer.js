// @flow
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'
import * as R from 'ramda'

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

export type DrawerOnTickCallback = (
  fps: number,
  delta: number,
  redrawTime: number,
  debugInfo: Array<DrawerDebugInfoUnit>
) => void

export type DrawerDebugInfoCallback<T: Object> = (ExtDrawerState<T>) => Array<DrawerDebugInfoUnit>
export type DrawerInitCallback<T: Object> = (DrawerState) => ExtDrawerState<T>
export type DrawerRedrawCallback<T: Object> = (ExtDrawerState<T>) => ExtDrawerState<T>

export type InitDrawerResult = (onTickCallback: DrawerOnTickCallback) => void

export const startDrawer = <T: Object>(
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

  // const bg = new PIXI.Graphics()
  // bg.beginFill(Color.to_pixi([0, 0, 0]))
  // bg.drawRect(0, 0, realSize, realSize)
  // bg.endFill()
  // pixi.stage.addChild(bg)

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
    // we left the page with sample, so destroy pixi app
    if (!document.getElementById('view') || document.getElementById('view') !== pixi.view) {
      pixi.destroy()
      return
    }
    state.tick_delta = delta
    state.tickTime += delta
    const startTS = (new Date()).getTime()
    // $FlowIgnore FIXME dont understand whats wrong
    state = redraw(state)
    const finishTS = (new Date()).getTime()
    // its a hellish hack actially cause its called on*Tick*callback() but as soon as we use it for debug info
    // no need to update it too often
    if (state.ticks % 10 === 0) {
      // TODO merge all to updateDebugInfo() result
      onTickCallback(pixi.ticker.FPS, finishTS - startTS, delta, updateDebugInfo(state))
    }
  })

  // creating screenshots from pixi.stage
  // $FlowIgnore
  document.addEventListener('keydown', e => {
    // Ctrl + q
    if (e.code === 'KeyQ') {
      const filename: string = R.last(window.location.href.split('/')) || ''
      console.log('take screenshot', filename)
      const screenshot = new PIXI.Container()
      const bg = new PIXI.Graphics()
      bg.beginFill(Color.to_pixi([0, 0, 0]))
      bg.drawRect(0, 0, realSize, realSize)
      bg.endFill()
      screenshot.addChild(bg)
      // i tried this simple way -- it works, but resulting image quality is very, very bad, so i tried another way
      // screenshot.width = 200
      // screenshot.height = 200
      // screenshot.scale = state.base_container.scale
      screenshot.addChild(state.base_container)
      const img = pixi.renderer.plugins.extract.image(screenshot)
      pixi.stage.addChild(state.base_container)

      // resize img to 200 px. taken from https://stackoverflow.com/a/39637827
      const width = 200
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const oc = document.createElement('canvas')
        const octx = oc.getContext('2d')
        canvas.width = width // destination canvas size
        canvas.height = canvas.width * img.height / img.width
        let cur = {
          width: Math.floor(img.width * 0.5),
          height: Math.floor(img.height * 0.5)
        }
        oc.width = cur.width
        oc.height = cur.height
        octx.drawImage(img, 0, 0, cur.width, cur.height)
        while (cur.width * 0.5 > width) {
          cur = {
            width: Math.floor(cur.width * 0.5),
            height: Math.floor(cur.height * 0.5)
          }
          octx.drawImage(oc, 0, 0, cur.width * 2, cur.height * 2, 0, 0, cur.width, cur.height)
        }
        ctx.drawImage(oc, 0, 0, cur.width, cur.height, 0, 0, canvas.width, canvas.height)

        const a = document.createElement('a')
        // $FlowIgnore
        document.body.append(a)
        a.download = filename
        a.href = canvas.toDataURL('image/png')
        a.click()
        a.remove()
        screenshot.destroy()
      }
    }
  })
}

export const initDrawer = <T: Object>(
  regime: DrawerRegime,
  updateDebugInfo: DrawerDebugInfoCallback<T>,
  initGraphics: DrawerInitCallback<T>,
  redraw: DrawerRedrawCallback<T>,
): InitDrawerResult => (onTickCallback: DrawerOnTickCallback): void => startDrawer(
    regime,
    updateDebugInfo,
    initGraphics,
    redraw,
    onTickCallback
  )
