// @flow
import * as R from 'ramda'

import * as U from 'enot-simon-utils/lib/utils'

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
  children: Array<RRTPointId>,
|}
export type RRTDiagram = Array<RRTPoint>
export type RRTGenerationsIndex = Array<Array<RRTPointId>>
export type RRTWDPoint = {| ...RRTPoint, height: number |}
export type RRTWDDiagram = Array<RRTWDPoint>


const REJECT_LIMIT = 500

// gathers array which index is generation and value -- array of points of that generation
// Array<Array<RRTPoint>> actually is Array<RRTDiagram> but i cant call it so (((
// TODO point index! not object!
export const pointsByGenerationsIndex = (rrt: RRTDiagram): RRTGenerationsIndex => {
  const generations = R.sort((e1, e2) => e1 - e2, R.uniq(R.map(p => p.generation, rrt)))
  return R.map(g => R.map(p => p.index, R.filter(p => p.generation === g, rrt)))(generations)
}

export const generate = (step: number, randPointFunc: RandPointFunc, roots: Array<XYPoint>): RRTDiagram => {
  const rootPoints = (roots.length > 0 ? roots : [randPointFunc()]).map((p, index) => ({
    ...p,
    // generation is my name to graph depth. TODO rename
    generation: 0,
    // index = 0 cause we should be able to access rrt array of point by array index!
    index,
    parent: null,
    children: [],
  }))
  return calcChildrenIndex(generateRec(step, step ** 2, randPointFunc, rootPoints))
}

export const calcHeight = (rrt: RRTDiagram): RRTWDDiagram => calcHeightRec(rrt, R.map(e => e.index, rrt), 0)


const calcHeightRec = (orrt, openList, height): RRTWDDiagram => {
  const rrt = [...orrt]
  const leafs = R.filter(index => {
    const point = rrt[index]
    const plusGoodParent = point.parent !== null && rrt[point.parent].height === undefined ? 1 : 0
    const goodChildren = R.filter(ci => rrt[ci].height === undefined, point.children)
    // sic! sometimes it can be 0
    const isLeaf = (goodChildren.length + plusGoodParent) <= 1
    return isLeaf
  }, openList)
  R.forEach(i => {
    // $FlowIgnore
    rrt[i].height = height
  }, leafs)
  // not very optimal, should use index
  const newOpenList = R.difference(openList, leafs)
  if (newOpenList.length === 0) {
    // $FlowIgnore
    return rrt
  }
  return calcHeightRec(rrt, newOpenList, height + 1)
}

const generateRec = (step, qStep, randPointFunc: RandPointFunc, points: RRTDiagram = []): RRTDiagram => {
  const point = getNewPoint(points.length, step, qStep, randPointFunc, points)
  if (!point) {
    return points
  }
  return generateRec(step, qStep, randPointFunc, [...points, point])
}

const getNewPoint = (
  index: number,
  step: number,
  qStep: number,
  randPointFunc: RandPointFunc,
  points: RRTDiagram,
  counter: number = 0
): ?RRTPoint => {
  if (counter > REJECT_LIMIT) {
    return null
  }
  const newPoint = randPointFunc()
  const nearest = U.findNearestPoint(newPoint, points)
  if (U.quadDistance(newPoint, nearest) < qStep) {
    return getNewPoint(index, step, qStep, randPointFunc, points, counter + 1)
  }
  const theta = Math.atan2(newPoint.y - nearest.y, newPoint.x - nearest.x)
  const pp = {
    x: nearest.x + step * Math.cos(theta),
    y: nearest.y + step * Math.sin(theta),
    generation: nearest.generation + 1,
    index,
    parent: nearest.index,
    children: [],
  }
  return pp
}

const calcChildrenIndex = (rrt: RRTDiagram): RRTDiagram => {
  return R.reduce((acc, p) => {
    if (p.parent == null) {
      return acc
    }
    acc[p.parent].children.push(p.index)
    return acc
  }, rrt, rrt)
}
