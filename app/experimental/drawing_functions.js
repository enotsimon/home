// @flow
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'

// a ring that works like a drawing mask -- nothing outside it is drawing
export const addCircleMask = (graphics: Object, parentContainer: Object, size: number): void => {
  const mask = new PIXI.Graphics()
  mask.beginFill(Color.to_pixi([255, 255, 255]))
  // FIXME pass coords
  mask.drawCircle(size / 2, size / 2, size / 2)
  mask.endFill()
  /* eslint-disable-next-line no-param-reassign */
  graphics.mask = mask
  parentContainer.addChild(mask)
  const contour = new PIXI.Graphics()
  const contourWidth = size / 200
  contour.lineStyle(contourWidth, Color.to_pixi([255, 255, 255]))
  contour.drawCircle(size / 2, size / 2, size / 2 - contourWidth / 2)
  parentContainer.addChild(contour)
}
