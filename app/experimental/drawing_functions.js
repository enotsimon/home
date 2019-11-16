// @flow

// these functions are full of operations on PIXI objects and the're cannon be cloned, so disable no-param-reassign
/* eslint-disable no-param-reassign */

import * as Color from 'common/color'
import * as PIXI from 'pixi.js'

import type { XYPoint } from 'common/utils'

// a ring that works like a drawing mask -- nothing outside it is drawing
export const addCircleMask = (graphics: Object, parentContainer: Object, size: number): void => {
  const mask = new PIXI.Graphics()
  mask.beginFill(Color.to_pixi([255, 255, 255]))
  // FIXME pass coords
  mask.drawCircle(size / 2, size / 2, size / 2)
  mask.endFill()
  graphics.mask = mask
  parentContainer.addChild(mask)
  const contour = new PIXI.Graphics()
  const contourWidth = size / 200
  contour.lineStyle(contourWidth, Color.to_pixi([255, 255, 255]))
  contour.drawCircle(size / 2, size / 2, size / 2 - contourWidth / 2)
  parentContainer.addChild(contour)
}

export const rotateGraphics = (graphics: Object, angle: number, anchor: XYPoint): void => {
  // const angle = state.angle + Math.PI / 180 / 6
  graphics.pivot = { x: anchor.x, y: anchor.y }
  graphics.x = anchor.x
  graphics.y = anchor.y
  graphics.rotation = angle
}
