// @flow
import * as R from 'ramda'
import * as U from 'common/utils'

import type { XYPoint } from 'common/utils'

export type Vector = XYPoint
// TODO remove it from here
export type MassSpeedPoint = {|
  ...SpeedPoint,
  mass: number,
|}
export type SpeedPoint = {|
  ...XYPoint,
  speed: Vector,
|}
export type SpeedPointIE = { ...SpeedPoint }
export type ArrOrObjOfSpeedPointIE = $ReadOnlyArray<SpeedPointIE> | $ReadOnly<{[string]: SpeedPointIE}>
type ForceFunc = (distToBorder: number, circleRadius: number, forceMul: number) => number


const circleBorderForceAcceleration = (forceFunc: ForceFunc) => (
  points: ArrOrObjOfSpeedPointIE,
  circleRadius: number,
  forceMul: number,
  returnPoints: boolean,
): ArrOrObjOfSpeedPointIE => R.map(p => {
  const { angle, radius } = U.toPolarCoords({ x: p.x, y: p.y })
  const distToBorder = circleRadius - radius
  const radiusVector = forceFunc(distToBorder, circleRadius, forceMul)
  // const accVector = U.fromPolarCoords({ angle: angle + Math.PI, radius: radiusVector })
  const accVector = U.fromPolarCoords({ angle, radius: -radiusVector })
  // TODO add check if point is beyond circle and return it back?
  const speed = crossSumm(p.speed, accVector)
  if (returnPoints && radius > circleRadius) {
    return { ...p, ...U.fromPolarCoords({ angle, radius: circleRadius }), speed: accVector }
  }
  return { ...p, speed }
})(points)

const crossSumm = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })

const hyperboleFunc = (distToBorder, circleRadius, forceMul) =>
  Math.max(0, forceMul / (distToBorder / circleRadius - 10)) // FIXME 10!!!

const linearFunc = (distToBorder, circleRadius, forceMul) =>
  forceMul * (circleRadius - distToBorder)


// naive circle border -- just return point back if they out of circle
export const returnPointsToCircle = <T: { ...XYPoint }>(points: Array<T>, circleRadius: number): Array<T> => {
  return points.map(p => {
    const { angle, radius } = U.toPolarCoords(p)
    if (radius > circleRadius) {
      const { x, y } = U.fromPolarCoords({ angle, radius: circleRadius })
      return { ...p, x, y }
    }
    return p
  })
}

export const calcCircleBorderForceAcceleration = (
  points: ArrOrObjOfSpeedPointIE,
  circleRadius: number,
  forceDistanse: number,
): ArrOrObjOfSpeedPointIE => R.map(p => {
  const { angle, radius } = U.toPolarCoords({ x: p.x, y: p.y })
  const distToBorder = circleRadius - radius
  const radiusVector = 0.5 * 1 / Math.exp(distToBorder - circleRadius / forceDistanse)
  const accVector = U.fromPolarCoords({ angle: angle + Math.PI, radius: radiusVector })
  return { ...p, speed: crossSumm(p.speed, accVector) }
})(points)

// TODO spread syntax?
export const circleBorderForceHyperbole = (
  points: ArrOrObjOfSpeedPointIE,
  circleRadius: number,
  forceMul: number,
  returnPoints: boolean = true,
): ArrOrObjOfSpeedPointIE => circleBorderForceAcceleration(hyperboleFunc)(points, circleRadius, forceMul, returnPoints)

export const circleBorderForceLinear = (
  points: ArrOrObjOfSpeedPointIE,
  circleRadius: number,
  forceMul: number,
  returnPoints: boolean = true,
): ArrOrObjOfSpeedPointIE => circleBorderForceAcceleration(linearFunc)(points, circleRadius, forceMul, returnPoints)
