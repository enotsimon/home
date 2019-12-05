// @flow
import * as R from 'ramda'
import * as U from 'common/utils'

import type { XYPoint } from 'common/utils'

export type Vector = XYPoint
export type MassSpeedPoint = {|
  ...XYPoint,
  mass: number,
  speed: Vector,
|}

// naive circle border -- just return point back if they out of circle
export const returnPointsToCircle = <T: { ...MassSpeedPoint }>(points: Array<T>, circleRadius: number): Array<T> => {
  return points.map(p => {
    const { angle, radius } = U.toPolarCoords(p)
    if (radius > circleRadius) {
      const { x, y } = U.fromPolarCoords({ angle, radius: circleRadius })
      return { ...p, x, y }
    }
    return p
  })
}

export const calcCircleBorderForceAcceleration = <T: { ...MassSpeedPoint }>(
  points: Array<T>,
  circleRadius: number,
  forceDistanse: number,
): Array<T> => R.map(p => {
    const { angle, radius } = U.toPolarCoords({ x: p.x, y: p.y })
    const distToBorder = circleRadius - radius
    const radiusVector = 0.5 * 1 / Math.exp(distToBorder - circleRadius / forceDistanse)
    const accVector = U.fromPolarCoords({ angle: angle + Math.PI, radius: radiusVector })
    return { ...p, speed: crossSumm(p.speed, accVector) }
  })(points)

const crossSumm = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })
