// @flow

// these functions are full of operations on PIXI objects and the're cannon be cloned, so disable no-param-reassign
/* eslint-disable no-param-reassign */

import * as Color from 'enot-simon-utils/lib/color'
import { Graphics } from 'pixi.js'

import type { XYPoint } from 'enot-simon-utils/lib/utils'
import type { RGBArray } from 'enot-simon-utils/lib/color'
import type { RRTPoint } from 'enot-simon-utils/lib/rrt_diagram'

// a ring that works like a drawing mask -- nothing outside it is drawing
export const addCircleMask = (
  graphics: Object,
  radius: number,
  center: XYPoint = { x: 0, y: 0 },
  fillColor: RGBArray = [255, 255, 255]
): void => {
  const mask = new Graphics()
  mask.beginFill(Color.to_pixi([255, 255, 255]))
  // FIXME pass coords
  mask.drawCircle(center.x, center.y, radius)
  mask.endFill()
  graphics.mask = mask
  const contour = new Graphics()
  const contourWidth = radius / 100
  contour.lineStyle(contourWidth, Color.to_pixi(fillColor))
  contour.drawCircle(center.x, center.y, radius - contourWidth / 2)
  // TODO z-index?
  graphics.addChild(contour)
  // to graphics?
  graphics.addChild(mask)
}

export const rotateGraphics = (graphics: Object, angle: number, anchor: XYPoint): void => {
  // const angle = state.angle + Math.PI / 180 / 6
  graphics.pivot = { x: anchor.x, y: anchor.y }
  graphics.x = anchor.x
  graphics.y = anchor.y
  graphics.rotation = angle
}

export const drawDottedPoint = (color: RGBArray, width: number): Object => {
  const graphics = new Graphics()
  graphics.alpha = 1
  graphics.clear()
  graphics.beginFill(Color.to_pixi(color), 1)
  graphics.drawCircle(0, 0, width)
  graphics.endFill()
  graphics.beginFill(Color.to_pixi([0, 0, 0]), 1)
  graphics.drawCircle(0, 0, width / 2)
  graphics.endFill()
  graphics.name = 'base'
  const aplhaMaskGraphics = new Graphics()
  aplhaMaskGraphics.addChild(graphics)
  aplhaMaskGraphics.alpha = 0
  aplhaMaskGraphics.beginFill(Color.to_pixi([0, 0, 0]), 1)
  aplhaMaskGraphics.drawCircle(0, 0, width)
  aplhaMaskGraphics.endFill()
  aplhaMaskGraphics.name = 'aplhaMask'
  const container = new Graphics()
  container.addChild(graphics)
  container.addChild(aplhaMaskGraphics)
  return container
}

export const drawLine = <T: { ...XYPoint }>(container: Object, color: RGBArray, width: number, p1: T, p2: T): void => {
  const graphics = new Graphics()
  graphics.lineStyle(width, Color.to_pixi(color))
  graphics.moveTo(p1.x, p1.y)
  graphics.lineTo(p2.x, p2.y)
  container.addChild(graphics)
}

// TODO it duplicates drawDottedPoint()
export const drawRRTPoint = <T: { ...RRTPoint }>(
  graphics: Object,
  point: T,
  color: RGBArray,
  bgColor: RGBArray,
  radius: number,
  alpha: number = 1
): void => {
  graphics.beginFill(Color.to_pixi(color), alpha)
  graphics.drawCircle(point.x, point.y, radius)
  graphics.endFill()
  graphics.beginFill(Color.to_pixi(bgColor), alpha)
  graphics.drawCircle(point.x, point.y, radius / 2)
  graphics.endFill()
}

export const drawRRTLink = <T: { ...RRTPoint }>(
  graphics: Object,
  point: T,
  parent: T,
  color: RGBArray,
  width: number,
  alpha: number = 1
): void => {
  graphics.lineStyle(width, Color.to_pixi(color), alpha)
  graphics.moveTo(parent.x, parent.y)
  graphics.lineTo(point.x, point.y)
}
