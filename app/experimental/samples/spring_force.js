// @flow
/**
 * это корочи как d3.force -- пружинки между точками и точки должны разворачиваться под действием
 * силы пружинок
 * TODO
 * - все коэффициэнты сил очень взаимосвязаны -- меняещь один и все идет раком, надо выразить их все через
 * отношения др-др и к какому-то базовому
 * - динамическое добавление и удаление точек
 * - оптимизация distance в allRepulsingForce() и springForce() и может быть circleBorderForceLinear()
 * - избавиться от returnPointsToCircle, втащить это в circleBorderForceLinear()
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
import type { MassSpeedPoint } from 'experimental/circle_border'

// type Vector = XYPoint
type PointId = number
type Point = {|
  ...MassSpeedPoint,
  id: PointId,
|}

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
  points: Array<Point>,
  links: Array<Link>,
  pairs: Array<Link>,
  debugInfo: {

  },
|}

type FroceFunc = (Point, Point, number, Link) => number

// const FORCE_STRENGTH = 0.05
const COUNT_POINTS = 50
const LINKS_LENGTH = 500 / COUNT_POINTS
const FORCE_MUL = 0.01
const REPULSING_FORCE_MUL = 0.05
const REPULSING_FORCE_MAX_DIST_MUL = 1
const SLOWDOWN_MUL = 0.8
const CB_FORCE_MUL = 0.0025
const MAX_SPEED_QUAD_TRIGGER = 0.005 // 0.001
const THROTTLE = 0
const FIND_CROSSING_THROTTLE = 250
const HANDLE_CROSSING_POWER = 0.1
// const LENGTH_MAX_MUL = 0.3
// const LENGTH_MIN_MUL = 0.1

const initGraphics = (oldState: DrawerState): State => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.points = R.map(id => {
    const { x, y } = U.fromPolarCoords(randomPointPolar(state.size / 2))
    return { id, x, y, mass: 0, speed: { x: 0, y: 0 } }
  })(R.range(0, COUNT_POINTS))
  // each point has one link to ramdom another one
  state.links = R.reduce((accLinks, p) => {
    const possibleTargetPoints = removeSelfAndBackLinks(state.points, accLinks, p)
    if (possibleTargetPoints.length === 0) {
      throw new Error('no possible target points')
    }
    const targetPoint = U.randElement(possibleTargetPoints)
    // FIXME length: 10 its first simple way
    return [...accLinks, { p1: p.id, p2: targetPoint.id, length: LINKS_LENGTH }]
  }, [], state.points)
  // list of all point pairs for repulsing force -- save it in state for saving calculations
  state.pairs = R.map(
    // its a fake link, just to make funcs types simplier
    ([id1, id2]) => ({ p1: id1, p2: id2, length: 0 }),
    U.noOrderNoSameValuesPairs(R.map(p => p.id, state.points))
  )
  initDrawings(state.base_container, state.points)
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
  let startTS
  startTS = (new Date()).getTime()
  const rfVectors = calcAllRepulsingForce(state.points, state.pairs, (REPULSING_FORCE_MAX_DIST_MUL * state.size) ** 2)
  const repulsingForceTime = (new Date()).getTime() - startTS
  startTS = (new Date()).getTime()
  const sfVectors = calcSpringForce(state.points, state.links)
  const springForceTime = (new Date()).getTime() - startTS
  state.points = addVectorsToPointsSpeed(state.points, [...rfVectors, ...sfVectors])
  startTS = (new Date()).getTime()
  state.points = circleBorderForceLinear(state.points, state.size / 2, CB_FORCE_MUL)
  const circleBorderForceTime = (new Date()).getTime() - startTS
  startTS = (new Date()).getTime()
  state.points = state.points.map(p => ({ ...p, x: p.x + p.speed.x, y: p.y + p.speed.y }))
  const applySpeedTime = (new Date()).getTime() - startTS
  // speed slowdown -- its like resistance of the environment
  startTS = (new Date()).getTime()
  state.points = state.points.map(p => ({
    ...p,
    speed: { x: SLOWDOWN_MUL * p.speed.x, y: SLOWDOWN_MUL * p.speed.y }
  }))
  const slowdownTime = (new Date()).getTime() - startTS
  startTS = (new Date()).getTime()
  redrawGraphics(state.base_container, state.points, state.links)
  const redrawGraphicsTime = (new Date()).getTime() - startTS
  if (state.ticks % FIND_CROSSING_THROTTLE === 0 && maxSpeedQuad(state.points) <= MAX_SPEED_QUAD_TRIGGER) {
    const crossingLinks = findCrossingLinks(state.links, state.points)
    if (crossingLinks.length) {
      console.log('handleCrossingLinks', crossingLinks.length)
    }
    state.points = handleCrossingLinks(crossingLinks, state.points, state.size)
  }
  state.debugInfo = {
    repulsingForceTime,
    springForceTime,
    circleBorderForceTime,
    applySpeedTime,
    slowdownTime,
    redrawGraphicsTime,
  }
  return state
}

const redrawGraphics = (container, points, links) => {
  points.forEach(p => {
    const graphics = container.getChildByName(drawerPointId(p))
    if (!graphics) {
      throw new Error(`point graphics not found by id ${p.id}`)
    }
    graphics.x = p.x
    graphics.y = p.y
  })
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

const findCrossingLinks = (links: Array<Link>, points: Array<Point>): Array<Link> => R.chain(
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

const handleCrossingLinks = (links: Array<Link>, points: Array<Point>, worldSize: number): Array<Link> => {
  const targetPoints = R.uniq(R.chain(l => [l.p1, l.p2], links))
  return R.map(p => {
    if (R.contains(p.id, targetPoints)) {
      const radius = HANDLE_CROSSING_POWER * worldSize
      const speed = U.fromPolarCoords({ radius, angle: random.float(0, 2 * Math.PI) })
      return { ...p, speed }
    }
    return p
  }, points)
}

const removeSelfAndBackLinks = (points, links, point): Array<Point> => {
  const badIdsFromLinks = R.chain(l => ((l.p1 === point.id || l.p2 === point.id) ? [l.p1, l.p2] : []), links)
  const badIds = R.uniq([...badIdsFromLinks, point.id])
  return R.filter(p => !R.contains(p.id, badIds), points)
}

const getLinkPoints = (link, points) => {
  const p1 = R.find(p => p.id === link.p1, points)
  const p2 = R.find(p => p.id === link.p2, points)
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
  points: Array<Point>,
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

const addVectorsToPointsSpeed = (points: Array<Point>, vectors: Array<Vector>): Array<Point> => {
  const vectorsByIds = aggregateVectorsByIds(vectors)
  return R.map(point => {
    const myVectors = vectorsByIds[point.id] || []
    return R.reduce((p, vector) => {
      return { ...p, speed: { x: p.speed.x + vector.x, y: p.speed.y + vector.y } }
    }, point, myVectors)
  }, points)
}

const maxSpeedQuad = points =>
  R.reduce((cur, e) => Math.max(cur, e), 0, R.map(({ speed: { x, y } }) => (x ** 2) + (y ** 2), points))

const debugInfo = state => [
  { text: 'repulsingForceTime', value: state.debugInfo.repulsingForceTime },
  { text: 'springForceTime', value: state.debugInfo.springForceTime },
  { text: 'circleBorderForceTime', value: state.debugInfo.circleBorderForceTime },
  { text: 'applySpeedTime', value: state.debugInfo.applySpeedTime },
  { text: 'slowdownTime', value: state.debugInfo.slowdownTime },
  { text: 'redrawGraphicsTime', value: state.debugInfo.redrawGraphicsTime },
  { text: 'max point speed quad', value: maxSpeedQuad(state.points) },
]

export const init = () => initDrawer('circle', debugInfo, initGraphics, redraw)
