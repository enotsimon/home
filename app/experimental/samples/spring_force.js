// @flow
/**
 * это как d3.force -- пружинки между точками и точки должны разворачиваться под действием силы пружинок
 * TODO
 * - все коэффициэнты сил очень взаимосвязаны -- меняещь один и все идет раком, надо выразить их все через
 * отношения др-др и к какому-то базовому
 * - динамическое добавление и удаление точек
 * - механизм распутывания графа сейчас очевидно не очень. надо другой -- искать всю ветку и поворачивать ее
 * - попробовать пересчитывать не все точки на тике, а хотя бы половину, можно на 3, на 4 части
 */
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import random from 'random'
import seedrandom from 'seedrandom'
import * as Color from 'common/color'
import * as U from 'common/utils'
import { addCircleMask } from 'experimental/drawing_functions'
import { initDrawer } from 'experimental/drawer'
import { randomPointPolar } from 'experimental/random_points'
import { circleBorderForceLinear } from 'experimental/circle_border'

import type { DrawerState } from 'experimental/drawer'
import type { XYPoint } from 'common/utils'
import type { SpeedPoint } from 'experimental/circle_border'

// type Vector = XYPoint
type PointId = string
type Point = {|
  ...SpeedPoint,
  id: PointId,
|}
type Points = {[PointId]: Point}

type Link = {
  p1: PointId,
  p2: PointId,
  length: number,
}

type Vector = {|
  ...XYPoint,
  point: PointId,
|}

type State = {|
  ...DrawerState,
  points: Points,
  links: Array<Link>,
  pairs: Array<Link>,
|}

type FroceFunc = (Point, Point, number, Link) => number

// const FORCE_STRENGTH = 0.05
const COUNT_POINTS = 50
const LINKS_LENGTH = 800 / COUNT_POINTS
const FORCE_MUL = 0.05
const REPULSING_FORCE_MUL = 0.05
const REPULSING_FORCE_MAX_DIST_MUL = 0.5
const SLOWDOWN_MUL = 0.9 // backward -- less value -- more slowdown
const CB_FORCE_MUL = 0.0025
const MAX_SPEED_QUAD_TRIGGER = 0.05 // 0.001
const THROTTLE = 0
const FIND_CROSSING_THROTTLE = 50
const HANDLE_CROSSING_POWER = 2
// const LENGTH_MAX_MUL = 0.3
// const LENGTH_MIN_MUL = 0.1

const initGraphics = (oldState: DrawerState): State => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.points = R.indexBy(R.prop('id'), R.map(id => {
    const { x, y } = U.fromPolarCoords(randomPointPolar(state.size / 2))
    return { id: `p${id}`, x, y, speed: { x: 0, y: 0 } }
  }, R.range(0, COUNT_POINTS)))
  // each point has one link to ramdom another one
  const pointsArray = R.values(state.points)
  state.links = R.reduce((accLinks, p) => {
    const possibleTargetPoints = removeSelfAndBackLinks(pointsArray, accLinks, p)
    if (possibleTargetPoints.length === 0) {
      throw new Error('no possible target points')
    }
    const targetPoint = U.randElement(possibleTargetPoints)
    // FIXME length: 10 its first simple way
    return [...accLinks, { p1: p.id, p2: targetPoint.id, length: LINKS_LENGTH }]
  }, [], pointsArray)
  // list of all point pairs for repulsing force -- save it in state for saving calculations
  state.pairs = R.map(
    // its a fake link, just to make funcs types simplier
    ([id1, id2]) => ({ p1: id1, p2: id2, length: 0 }),
    U.noOrderNoSameValuesPairs(R.map(p => p.id, pointsArray))
  )
  initDrawings(state.base_container, pointsArray)
  addCircleMask(state.base_container, state.size / 2)
  return state
}

const initDrawings = (container, points) => {
  points.forEach(p => {
    const graphics = createPointGraphics(p)
    graphics.name = drawerPointId(p)
    container.addChild(graphics)
  })
  const linksContainer = new PIXI.Graphics()
  linksContainer.name = 'linksContainer'
  container.addChild(linksContainer)
}

const drawerPointId = point => `p-${point.id}`
// const drawerLinkId = link => `l-${link.p1}-${link.p2}`

const createPointGraphics = point => {
  const graphics = new PIXI.Graphics()
  graphics.beginFill(Color.to_pixi([255, 255, 255]), 1)
  graphics.drawCircle(0, 0, 1.5)
  graphics.endFill()
  graphics.x = point.x
  graphics.y = point.y
  return graphics
}

const redraw = (oldState: State): State => {
  const state = { ...oldState }
  if (THROTTLE && state.ticks % THROTTLE !== 0) {
    return state
  }
  const rfVectors = calcAllRepulsingForce(state.points, state.pairs, (REPULSING_FORCE_MAX_DIST_MUL * state.size) ** 2)
  const sfVectors = calcSpringForce(state.points, state.links)
  state.points = addVectorsToPointsSpeed(state.points, [...rfVectors, ...sfVectors])
  state.points = circleBorderForceLinear(state.points, state.size / 2, CB_FORCE_MUL)
  state.points = R.map(p => ({ ...p, x: p.x + p.speed.x, y: p.y + p.speed.y }), state.points)
  // speed slowdown -- its like resistance of the environment
  state.points = R.map(p => ({
    ...p,
    speed: { x: SLOWDOWN_MUL * p.speed.x, y: SLOWDOWN_MUL * p.speed.y }
  }), state.points)
  redrawGraphics(state.base_container, state.points, state.links)
  if (state.ticks % FIND_CROSSING_THROTTLE === 0 && maxSpeedQuad(state.points) <= MAX_SPEED_QUAD_TRIGGER) {
    const crossingLinks = findCrossingLinks(state.links, state.points)
    if (crossingLinks.length) {
      console.log('handleCrossingLinks', crossingLinks.length)
    }
    state.points = handleCrossingLinks(crossingLinks, state.points)
  }
  return state
}

const redrawGraphics = (container, points, links) => {
  R.forEach(p => {
    const graphics = container.getChildByName(drawerPointId(p))
    if (!graphics) {
      throw new Error(`point graphics not found by id ${p.id}`)
    }
    graphics.x = p.x
    graphics.y = p.y
  }, R.values(points))
  const linksContainer = container.getChildByName('linksContainer')
  linksContainer.removeChildren()
  links.forEach(l => {
    const [p1, p2] = getLinkPoints(l, points)
    const graphics = new PIXI.Graphics()
    graphics.lineStyle(0.5, Color.to_pixi([255, 255, 255]))
    graphics.moveTo(p1.x, p1.y)
    graphics.lineTo(p2.x, p2.y)
    linksContainer.addChild(graphics)
  })
}

const findCrossingLinks = (links: Array<Link>, points: Points): Array<Link> => R.chain(
  ([l1, l2]) => {
    if (l1.p1 === l2.p1 || l1.p1 === l2.p2 || l1.p2 === l2.p1 || l1.p2 === l2.p2) {
      return []
    }
    const [p11, p12] = getLinkPoints(l1, points)
    const [p21, p22] = getLinkPoints(l2, points)
    return U.intervalsCrossPointNoEdge(p11, p12, p21, p22) ? [l1, l2] : []
  },
  U.noOrderNoSameValuesPairs(links)
)

const handleCrossingLinks = (links: Array<Link>, points: Points): Points => {
  const vectors = R.map(l => {
    const [p1, p2] = getLinkPoints(l, points)
    return { point: p1.id, x: HANDLE_CROSSING_POWER * (p2.x - p1.x), y: HANDLE_CROSSING_POWER * (p2.y - p1.y) }
  }, links)
  return addVectorsToPointsSpeed(points, vectors)
}

const removeSelfAndBackLinks = (points: Array<Point>, links, point): Array<Point> => {
  const badIdsFromLinks = R.chain(l => ((l.p1 === point.id || l.p2 === point.id) ? [l.p1, l.p2] : []), links)
  const badIds = R.uniq([...badIdsFromLinks, point.id])
  return R.filter(p => !R.includes(p.id, badIds), points)
}

const getLinkPoints = (link, points) => {
  const p1 = points[link.p1]
  const p2 = points[link.p2]
  if (!p1 || !p2) {
    throw new Error(`point not found by id ${p1 ? link.p2 : link.p1}`)
  }
  return [p1, p2]
}

const calcAllRepulsingForce = (points, pairs, dlQuad) => vectorsByLinks(points, pairs, allRepulsingForce, dlQuad)
const calcSpringForce = (points, links) => vectorsByLinks(points, links, springForce)

const allRepulsingForce = (p1, p2, quadDistance) => {
  return REPULSING_FORCE_MUL * LINKS_LENGTH / quadDistance
}

const springForce = (p1, p2, quadDistance, link) => {
  // let it be linear for now
  return FORCE_MUL * ((link.length ** 2) - quadDistance) / quadDistance
}

const vectorsByLinks = (
  points: Points,
  links: Array<Link>,
  forceFunc: FroceFunc,
  distanceLimitQuad: number = 0
): Array<Vector> =>
  R.chain(link => {
    const [p1, p2] = getLinkPoints(link, points)
    const quadDistance = ((p1.x - p2.x) ** 2) + ((p1.y - p2.y) ** 2)
    if (distanceLimitQuad && (quadDistance > distanceLimitQuad)) {
      return []
    }
    const forceScalar = forceFunc(p1, p2, quadDistance, link)
    const pseudoPoint = { x: (p1.x - p2.x) * forceScalar, y: (p1.y - p2.y) * forceScalar }
    // console.log('DUI', distance, link.length, pseudoPoint)
    const p1Vector = { point: p1.id, x: pseudoPoint.x, y: pseudoPoint.y }
    const p2Vector = { point: p2.id, x: -pseudoPoint.x, y: -pseudoPoint.y }
    // console.log('PP', pseudoPoint, positionDiff)
    return [p1Vector, p2Vector]
  }, links)

const aggregateVectorsByIds = vectors => R.reduce((acc, v) => {
  // this code speed is critical, so thats why modify input args and push()
  if (!acc[v.point]) {
    acc[v.point] = []
  }
  acc[v.point].push(v)
  return acc
}, {}, vectors)

const addVectorsToPointsSpeed = (points: Points, vectors: Array<Vector>): Points => {
  const vectorsByIds = aggregateVectorsByIds(vectors)
  return R.map(point => {
    const myVectors = vectorsByIds[point.id] || []
    // this code speed is critical, thats why forEach and reassign input args
    /* eslint-disable-next-line no-param-reassign */
    myVectors.forEach(v => { point.speed = { x: point.speed.x + v.x, y: point.speed.y + v.y } })
    return point
  }, points)
}

const maxSpeedQuad = (points: Points) =>
  R.reduce((cur, e) => Math.max(cur, e), 0, R.map(({ speed: { x, y } }) => (x ** 2) + (y ** 2), R.values(points)))

export const init = () => initDrawer('circle', () => [], initGraphics, redraw)
