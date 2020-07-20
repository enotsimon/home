// @flow
import random from 'random'
import * as U from 'common/utils'
import * as R from 'ramda'

import type { XYPoint, PolarPoint } from 'common/utils'

export type DotId = number
export type Dot = {
  id: DotId,
  angle: number,
  radius: number,
  // store them cause too ofter we need to convert from polar
  x: number,
  y: number,
}
export type Dots = {[DotId]: Dot}

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

export const addDotsIntoCircleWithMinDistance = (
  scale: number,
  minDistance: number,
  limit: number,
  dots: Dots = {},
  cycles: number = 0
): Dots => {
  if (limit === 0) {
    return dots
  }
  if (cycles === 1000) {
    throw new Error('too many cycles')
  }
  // TODO stupid way, but -- dont care
  const x = random.int(-scale, scale)
  const y = random.int(-scale, scale)
  const { angle, radius } = U.toPolarCoords({ x, y })
  // minDistance i added because of circle contour
  if (radius > (scale - minDistance)) {
    return addDotsIntoCircleWithMinDistance(scale, minDistance, limit, dots, cycles)
  }
  const tooCloseToAnotherDot = R.find(d => U.distance(d, { x, y }) <= minDistance)(R.values(dots))
  if (tooCloseToAnotherDot) {
    return addDotsIntoCircleWithMinDistance(scale, minDistance, limit, dots, cycles + 1)
  }
  const dot = { id: limit, angle, radius, x, y }
  return addDotsIntoCircleWithMinDistance(scale, minDistance, limit - 1, { ...dots, [limit]: dot }, 0)
}
