// @flow
/**
 * это как d3.force -- пружинки между точками и точки должны разворачиваться под действием силы пружинок
 * TODO
 * - все коэффициэнты сил очень взаимосвязаны -- меняещь один и все идет раком, надо выразить их все через
 * отношения др-др и к какому-то базовому
 * - динамическое добавление и удаление точек. это отдельным семплом
 * - из rrt-диаграммы. это отдельным семплом
 * - неподвижные точки -- основание rrt-диаграммы -- это к пункту выше
 * - как-то изобразить градиент сил
 * - распутывание бага с ветками -- часто всего 1-2 точки вместо всей ветки
 * - распутывание завязано на all-repulsing-force что неправильно
 * - семпл начинается как куча точек без связей, потом связи появляются по-одной
 * - берем точки, строим связи ко всем поблизости. потом перекрещивающиеся связи "лопаются". ну или что-то такое
 */
import { Graphics } from 'pixi.js'
import * as R from 'ramda'
import random from 'random'
import seedrandom from 'seedrandom'
import * as Color from 'common/color'
import * as U from 'enot-simon-utils/lib/utils'
import { addCircleMask, drawDottedPoint, drawLine } from 'experimental/drawing_functions'
import { startDrawer } from 'experimental/drawer'
import { randomPointPolar } from 'experimental/random_points'
import { circleBorderForceLinear } from 'experimental/circle_border'

import type { DrawerState } from 'experimental/drawer'
import type { XYPoint } from 'common/utils'
import type { SpeedPoint } from 'experimental/circle_border'
import type { ChannelMatrix } from 'common/color'

const FIX_CROSSING_LINKS_VECTOR_LENGTH = 3

export type SpringForceConfig = {|
  COUNT_POINTS: number,
  LINKS_LENGTH: number,
  FORCE_MUL: number,
  REPULSING_FORCE_MUL: number,
  REPULSING_FORCE_MAX_DIST_MUL: number,
  SLOWDOWN_MUL: number, // backward -- less value -- more slowdown
  CB_FORCE_MUL: number,
  MAX_SPEED_QUAD_TRIGGER: number,
  CG_STEPS: number,
  COLOR_BRIGHTEN_MAX: number,
  COLOR_VALUES_LIST: Array<number>,
  REBUILD_EVERY: number,
|}

// type Vector = XYPoint
type PointId = string
type Point = {|
  ...SpeedPoint,
  id: PointId,
  group: number, // color group
  // duplicates information in state.links
  links: Array<PointId>,
  cg: number,
  clp: number, // crossing links point
|}
type Points = {| [PointId]: Point |} // FIXME Record

type Link = {|
  p1: PointId,
  p2: PointId,
  length: number,
|}

type Vector = {|
  ...XYPoint,
  point: PointId,
|}

type State = {|
  ...DrawerState,
  ...SpringForceConfig,
  LINKS_LENGTH: number,
  dlQuad: number,
  points: Points,
  links: Array<Link>,
  pairs: Array<Link>,
  colors: Array<ChannelMatrix>,
  colorStep: number,
|}

type FroceFunc = (Point, Point, number, Link) => number

const initGraphics = (oldState: State): State => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.dlQuad = (state.REPULSING_FORCE_MAX_DIST_MUL * state.size) ** 2
  state.colorStep = state.COLOR_BRIGHTEN_MAX / (state.size / 2)
  state.colors = U.shuffle(Color.matrixesByValuesList(state.COLOR_VALUES_LIST))
  // dont like blue colors -- they are hard to discern
  state.colors = R.filter(({ r, g }) => r > 0 || g > 0, state.colors)
  // console.log('color matrixes', state.colors)
  state.points = R.indexBy(e => e.id, R.map(id => {
    const { x, y } = U.fromPolarCoords(randomPointPolar(state.size / 2))
    const point: Point = { id: `p${id}`, x, y, speed: { x: 0, y: 0 }, group: 0, links: [], cg: 0, clp: 0 }
    return point
  }, R.range(0, state.COUNT_POINTS)))
  // each point has one link to ramdom another one
  const pointsArray = R.values(state.points)
  state.links = R.reduce((accLinks, p) => {
    const possibleTargetPoints = removeSelfAndBackLinks(pointsArray, accLinks, p)
    if (possibleTargetPoints.length === 0) {
      throw new Error('no possible target points')
    }
    const targetPoint = U.randElement(possibleTargetPoints)
    return [...accLinks, { p1: p.id, p2: targetPoint.id, length: state.LINKS_LENGTH }]
  }, [], pointsArray)
  // copy links data to points
  state.points = gatherPointLinks(state.points, state.links)
  state.points = gatherPointGroups(state.points)
  // list of all point pairs for repulsing force -- save it in state for saving calculations
  // tried some optimizations -- to do less calcs but works bad
  // const repForcePoints = R.values(state.points).filter(p => p.links.length !== 2)
  const repForcePoints = pointsArray
  state.pairs = R.map(
    // its a fake link, just to make funcs types simplier
    ([id1, id2]) => ({ p1: id1, p2: id2, length: 0 }),
    U.noOrderNoSameValuesPairs(R.map(p => p.id, repForcePoints))
  )
  initDrawings(state.base_container, R.values(state.points), state.colors)
  const cc = Color.forRGB(Color.matrixToRGB(state.colors[1]), e => e / 2)
  addCircleMask(state.base_container, state.size / 2, { x: 0, y: 0 }, cc)
  return state
}

const gatherPointLinks = (points: Points, links: Array<Link>): Points => R.reduce((acc, link) => {
  const p1 = acc[link.p1]
  const p2 = acc[link.p2]
  return { ...acc, [p1.id]: { ...p1, links: [...p1.links, p2.id] }, [p2.id]: { ...p2, links: [...p2.links, p1.id] } }
}, points, links)

export const gatherPointGroups = (points: Points): Points => {
  const subgraphs = U.findSubgraphs(points)
  const pointsGroups = R.mergeAll(subgraphs.map((subgraph, i) => R.map(() => i + 1, subgraph)))
  return R.map(p => ({ ...p, group: pointsGroups[p.id] }), points)
}

const initDrawings = (container, points, colors) => {
  container.removeChildren()
  const linksContainer = new Graphics()
  linksContainer.name = 'linksContainer'
  container.addChild(linksContainer)
  // points after links! emulation of zIndex. PIXI zIndex doesnot work, despite of sortableChildren = true. dunno why
  points.forEach(p => {
    const graphics = new Graphics()
    graphics.name = drawerPointId(p)
    const ci = p.group % R.length(colors)
    const amGraphics = drawDottedPoint(graphics, Color.matrixToRGB(colors[ci]), 1.5)
    amGraphics.name = amPointId(p)
    container.addChild(graphics)
    container.addChild(amGraphics)
  })
}

const drawerPointId = point => `p-${point.id}`
const amPointId = point => `pam-${point.id}`

const redraw = (oldState: State): State => {
  const state: State = { ...oldState }
  // calc all repulsing force
  const rff = (p1, p2, quadDist) => allRepulsingForce(p1, p2, quadDist, state.REPULSING_FORCE_MUL, state.LINKS_LENGTH)
  const rfVectors = vectorsByLinks(state.points, state.pairs, rff, state.dlQuad)
  // calc spring force
  const sff = (p1, p2, quadDistance, link) => springForce(p1, p2, quadDistance, link, state.FORCE_MUL)
  const sfVectors = vectorsByLinks(state.points, state.links, sff)
  state.points = addVectorsToPointsSpeed(state.points, [...rfVectors, ...sfVectors])
  state.points = circleBorderForceLinear(state.points, state.size / 2, state.CB_FORCE_MUL)
  state.points = R.map(p => ({ ...p, x: p.x + p.speed.x, y: p.y + p.speed.y }), state.points)
  // speed slowdown -- its like resistance of the environment
  state.points = R.map(p => {
    return { ...p, speed: { x: state.SLOWDOWN_MUL * p.speed.x, y: state.SLOWDOWN_MUL * p.speed.y } }
  }, state.points)
  if (maxSpeedQuad(state.points) <= state.MAX_SPEED_QUAD_TRIGGER) {
    // we find crossing links for only one link a tick -- to save speed and spread calculations thru ticks
    const curLink = state.links[state.ticks % state.links.length]
    state.points = findAndHandleCrossingLinks(curLink, state.links, state.points, state.CG_STEPS)
  }
  state.points = handleCGAndCLPPoints(state.points)
  redrawGraphics(state)
  // console.log(state.ticks)
  if ((state.ticks + 1) % state.REBUILD_EVERY === 0) {
    return initGraphics(state)
  }
  return state
}

// calc color channel
// const ccc = (orig: number, diff: number): number => (orig === 0 ? 0 : Math.round(orig + diff))

const redrawGraphics = (state: State): void => {
  const container = state.base_container
  const center = { x: 0, y: 0 }
  const pointDist = R.map(p => {
    const graphics = container.getChildByName(drawerPointId(p))
    const ssq = (state.size / 2) ** 2
    const alpha = U.normalizeValue(R.min(U.quadDistance(p, center), ssq), ssq, 0.75, 0, 0)
    graphics.x = p.x
    graphics.y = p.y
    const amGraphics = container.getChildByName(amPointId(p))
    amGraphics.x = p.x
    amGraphics.y = p.y
    amGraphics.alpha = alpha
    // let dotColor = p.cg ? [100, 0, 0] : color
    // dotColor = p.clp ? [150, 0, 0] : dotColor
    // drawDottedPoint(graphics, dotColor, 1.5)
    const ci = p.group % R.length(state.colors)
    const color = Color.forRGB(Color.matrixToRGB(state.colors[ci]), e => e * (1 - alpha))
    return { alpha, color }
  }, state.points)
  const linksContainer = container.getChildByName('linksContainer')
  linksContainer.removeChildren()
  state.links.forEach(l => {
    const [p1, p2] = getLinkPoints(l, state.points)
    const color = pointDist[l.p1].alpha > pointDist[l.p2].alpha ? pointDist[l.p1].color : pointDist[l.p2].color
    drawLine(linksContainer, color, 0.75, p1, p2)
  })
}

const gatherPointIdsFromLinks = links => R.uniq(R.chain(({ p1, p2 }) => [p1, p2], links))

const findAndHandleCrossingLinks = (link: Link, links: Array<Link>, points: Points, CG_STEPS: number): Points => {
  const crossingLinks = findCrossingLinks(link, links, points)
  return crossingLinks.length === 0 ? points : handleCrossingLinks([...crossingLinks, link], points, CG_STEPS)
}

const findCrossingLinks = (link: Link, links: Array<Link>, points: Points): Array<Link> => R.filter(l => {
  if (link.p1 === l.p1 || link.p1 === l.p2 || link.p2 === l.p1 || link.p2 === l.p2) {
    return false
  }
  const [p11, p12] = getLinkPoints(link, points)
  const [p21, p22] = getLinkPoints(l, points)
  // we checked edges upper
  return !!U.intervalsCrossPoint(p11, p12, p21, p22)
}, links)

const handleCrossingLinks = (crossingLinksAll, points: Points, CG_STEPS: number): Points => {
  const pointsFromCrossingLinks = gatherPointIdsFromLinks(crossingLinksAll)
  // TODO test these 2 lines cause work incorrect on cycles in graph
  const pointsCopyNoCL = U.removeLinks(points, crossingLinksAll)
  const pointChains = R.map(p => U.findByLinks(p, pointsCopyNoCL), pointsFromCrossingLinks)
  // logic says we should choose shortest chain but random works better including fact that upper 2 lines work incorrect
  const cgPointChains = U.randElement(pointChains)
  const pointsFromCrossingLinksInd = R.indexBy(e => e, pointsFromCrossingLinks)
  // const randDist = U.fromPolarCoords(randomPointPolar(100))
  const randDist = { x: 0, y: 0 }
  // const randLength = random.int(4, 8)
  return R.map(p => {
    if (cgPointChains[p.id]) {
      const vec = U.vectorToDist(p, randDist, FIX_CROSSING_LINKS_VECTOR_LENGTH)
      return { ...p, cg: CG_STEPS, speed: { x: p.speed.x + vec.x, y: p.speed.y + vec.y } }
    }
    if (pointsFromCrossingLinksInd[p.id]) {
      return { ...p, clp: CG_STEPS }
    }
    return p
  }, points)
}

const handleCGAndCLPPoints = (points: Points): Points => R.map(p => {
  if (p.cg || p.clp) {
    return { ...p, cg: p.cg > 0 ? p.cg - 1 : 0, clp: p.clp > 0 ? p.clp - 1 : 0 }
  }
  return p
}, points)

const removeSelfAndBackLinks = (points: Array<Point>, links, point): Array<Point> => {
  const badIdsFromLinks = R.chain(l => ((l.p1 === point.id || l.p2 === point.id) ? [l.p1, l.p2] : []), links)
  const badIds = R.uniq([...badIdsFromLinks, point.id])
  return R.filter(p => !R.includes(p.id, badIds), points)
}

const getLinkPoints = (link: Link, points: Points) => {
  const p1 = points[link.p1]
  const p2 = points[link.p2]
  if (!p1 || !p2) {
    throw new Error(`point not found by id ${p1 ? link.p2 : link.p1}`)
  }
  return [p1, p2]
}

const allRepulsingForce = (p1, p2, quadDistance, REPULSING_FORCE_MUL, LINKS_LENGTH) => {
  if (p1.cg || p2.cg) {
    return 0
  }
  return REPULSING_FORCE_MUL * LINKS_LENGTH / quadDistance
}

const springForce = (p1, p2, quadDistance, link, FORCE_MUL) => {
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

export const initSpringForce = (config: SpringForceConfig): void => startDrawer('circle', initGraphics, redraw, config)
