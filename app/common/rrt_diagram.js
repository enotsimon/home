// @flow
import * as R from 'ramda'

import * as U from 'common/utils'

import type { XYPoint } from 'common/utils'

export type RandPointFunc = () => XYPoint
export type RRTPointId = number
export type RRTPoint = {|
  ...XYPoint,
  // its like a length from root
  generation: number,
  // its a distance from most distant leaf
  index: RRTPointId,
  parent: ?RRTPointId,
|}
export type RRTDiagram = Array<RRTPoint>
export type RRTGenerationsIndex = Array<Array<RRTPointId>>
export type RRTWDPoint = {| ...RRTPoint, depth: number |}
export type RRTWDDiagram = Array<RRTWDPoint>


const REJECT_LIMIT = 500

// gathers array which index is generation and value -- array of points of that generation
// Array<Array<RRTPoint>> actually is Array<RRTDiagram> but i cant call it so (((
// TODO point index! not object!
export const pointsByGenerationsIndex = (rrt: RRTDiagram): RRTGenerationsIndex => {
  const generations = R.sort((e1, e2) => e1 - e2, R.uniq(R.map(p => p.generation, rrt)))
  return R.map(g => R.map(p => p.index, R.filter(p => p.generation === g, rrt)))(generations)
}

export const generate = (step: number, randPointFunc: RandPointFunc, rootPoint: ?XYPoint = null): RRTDiagram => {
  const firstPoint = {
    ...(rootPoint || randPointFunc()),
    // index = 0 cause we should be able to access rrt array of point by array index!
    // generation = 0 well... because index = 0 mean generation = 0
    generation: 0,
    index: 0,
    parent: null,
  }
  return generateRec(step, randPointFunc, [firstPoint])
}

export const calcDepth = (rrt: RRTDiagram): RRTWDDiagram => {
  const preIndex = R.map(e => ({ ...e, children: [] }), rrt)
  const childrenIndex = R.reduce((acc, p) => {
    if (p.parent == null) {
      return acc
    }
    acc[p.parent].children.push(p.index)
    return acc
  }, preIndex, preIndex)
  const leafsProcessed = R.map(p => {
    if (childrenIndex[p.index].children.length === 0) {
      return { ...p, depth: 0 }
    }
    return p
  }, rrt)
  return calcDepthRec(leafsProcessed, childrenIndex)
}


const calcDepthRec = (rrt, childrenIndex): RRTWDDiagram => {
  const has = R.any(e => !R.has('depth', e), rrt)
  if (!has) {
    // $FlowIgnore no null values here but dunno how to explain this to flow
    return rrt
  }
  const rrtNew = R.map(p => {
    if (p.depth !== undefined) {
      return p
    }
    const max = R.reduce((acc, i) => {
      const iDepth = rrt[i].depth
      if (acc === null || iDepth === undefined) {
        return null
      }
      return acc > iDepth ? acc : iDepth
    }, 0, childrenIndex[p.index].children)
    if (max === null) {
      return p
    }
    return { ...p, depth: max + 1 }
  }, rrt)
  return calcDepthRec(rrtNew, childrenIndex)
}

const generateRec = (step: number, randPointFunc: RandPointFunc, points: RRTDiagram = []): RRTDiagram => {
  const point = getNewPoint(points.length, step, randPointFunc, points)
  if (!point) {
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
): ?RRTPoint => {
  if (counter > REJECT_LIMIT) {
    return null
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
  return pp
}
