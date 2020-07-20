// @flow
import random from 'random'
import * as U from 'common/utils'
import * as R from 'ramda'

import type { XYPoint, PolarPoint } from 'common/utils'

export const randomPointsPolarNaive = (count: number, scale: number = 1): Array<XYPoint> => R.map(() => {
  const angle = random.float(0, 2 * Math.PI)
  const radius = random.float(0, scale)
  return U.fromPolarCoords({ angle, radius })
})(R.range(0, count))

export const randomPointsInSquare = (count: number, scale: number = 1): Array<XYPoint> => R.map(() => {
  return { x: random.float(0, scale), y: random.float(0, scale) }
})(R.range(0, count))

export const randomPointPolar = (radius: number = 1): PolarPoint =>
  ({ angle: 2 * Math.PI * random.float(), radius: radius * Math.sqrt(random.float()) })

export const randomPointInSquare = (scale: number = 1): XYPoint =>
  ({ x: random.float(0, scale), y: random.float(0, scale) })
