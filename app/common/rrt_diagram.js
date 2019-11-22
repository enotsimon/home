// @flow
import * as U from 'common/utils'

import type { XYPoint } from 'common/utils'

export type RandPointFunc = () => XYPoint
export type RRTPointId = number
export type RRTPoint = {|
  ...XYPoint,
  generation: number,
  index: RRTPointId,
  parent: ?RRTPointId,
|}
export type RRTDiagram = Array<RRTPoint>


const REJECT_LIMIT = 500

export const generate = (step: number, randPointFunc: RandPointFunc, rootPoint: ?XYPoint = null): RRTDiagram => {
  const firstPoint = {
    ...(rootPoint || randPointFunc()),
    generation: 0,
    index: 0,
    parent: null,
  }
  return generateRec(step, randPointFunc, [firstPoint])
}

const generateRec = (step: number, randPointFunc: RandPointFunc, points: RRTDiagram = []): RRTDiagram => {
  const { point, nearest } = getNewPoint(points.length, step, randPointFunc, points)
  if (!point || !nearest) {
    return points
  }
  return generateRec(step, randPointFunc, [...points, point])
}

const getNewPoint = (
  index: number,
  step: number,
  randPointFunc: RandPointFunc,
  points: RRTDiagram,
  counter: number = 0
): { point: ?RRTPoint, nearest: ?RRTPoint } => {
  if (counter > REJECT_LIMIT) {
    return { point: null, nearest: null }
  }
  const newPoint = randPointFunc()
  const nearest = U.findNearestPoint(newPoint, points)
  if (U.distance(newPoint, nearest) < step) {
    return getNewPoint(index, step, randPointFunc, points, counter + 1)
  }
  const theta = Math.atan2(newPoint.y - nearest.y, newPoint.x - nearest.x)
  const pp = {
    x: nearest.x + step * Math.cos(theta),
    y: nearest.y + step * Math.sin(theta),
    generation: nearest.generation + 1,
    index,
    parent: nearest.index,
  }
  return { point: pp, nearest }
}
