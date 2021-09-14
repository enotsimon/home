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
import { Graphics } from 'pixi.js'
import * as R from 'ramda'
import random from 'random'
import seedrandom from 'seedrandom'
import * as Color from 'common/color'
import * as U from 'common/utils'
import { addCircleMask, drawDottedPoint, drawLine } from 'experimental/drawing_functions'
import { initDrawer } from 'experimental/drawer'
import { randomPointPolar } from 'experimental/random_points'
import { circleBorderForceLinear } from 'experimental/circle_border'

import type { InitDrawerResult, DrawerState } from 'experimental/drawer'
import type { XYPoint } from 'common/utils'
import type { SpeedPoint } from 'experimental/circle_border'
import type { ChannelMatrix } from 'common/color'

// type Vector = XYPoint
type PointId = string
type Point = {|
  ...SpeedPoint,
  id: PointId,
  group: number, // color group
  contract: boolean,
  // duplicates information in state.links
  links: Array<PointId>,
|}
type Points = {| [PointId]: Point |} // FIXME Record

type Link = {|
  p1: PointId,
  p2: PointId,
  length: number,
  contract: number,
|}

type Vector = {|
  ...XYPoint,
  point: PointId,
|}

type State = {|
  ...DrawerState,
  points: Points,
  links: Array<Link>,
  pairs: Array<Link>,
  colors: Array<ChannelMatrix>,
  colorStep: number,
|}

type FroceFunc = (Point, Point, number, Link) => number

// const FORCE_STRENGTH = 0.05
const COUNT_POINTS = 100
const LINKS_LENGTH_MUL = 800
const LINKS_LENGTH = LINKS_LENGTH_MUL / COUNT_POINTS
const FORCE_MUL = 0.05
const REPULSING_FORCE_MUL = 0.05
const REPULSING_FORCE_MAX_DIST_MUL = 0.5
const SLOWDOWN_MUL = 0.9 // backward -- less value -- more slowdown
const CB_FORCE_MUL = 0.0025
const MAX_SPEED_QUAD_TRIGGER = 0.15 // TODO increasing speed tru time
const THROTTLE = 0
const REBUILD_EVERY = 2000
const CONTRACT_STEPS = 50
const COLOR_BRIGHTEN_MAX = 100
const COLOR_VALUES_LIST = [0, 50, 100]
const CIRCLE_MASK_COLOR = [0, 0, 100]
// const LENGTH_MAX_MUL = 0.3
// const LENGTH_MIN_MUL = 0.1

const initGraphics = (oldState: State): State => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.colorStep = COLOR_BRIGHTEN_MAX / (state.size / 2)
  state.colors = U.shuffle(Color.matrixesByValuesList(COLOR_VALUES_LIST))
  // console.log('color matrixes', state.colors)
  state.points = R.indexBy(e => e.id, R.map(id => {
    const { x, y } = U.fromPolarCoords(randomPointPolar(state.size / 2))
    const point: Point = { id: `p${id}`, x, y, speed: { x: 0, y: 0 }, group: 0, contract: false, links: [] }
    return point
  }, R.range(0, COUNT_POINTS)))
  // each point has one link to ramdom another one
  const pointsArray = R.values(state.points)
  state.links = R.reduce((accLinks, p) => {
    const possibleTargetPoints = removeSelfAndBackLinks(pointsArray, accLinks, p)
    if (possibleTargetPoints.length === 0) {
      throw new Error('no possible target points')
    }
    const targetPoint = U.randElement(possibleTargetPoints)
    return [...accLinks, { p1: p.id, p2: targetPoint.id, length: LINKS_LENGTH, contract: 0 }]
  }, [], pointsArray)
  // copy links data to points
  state.points = gatherPointLinks(state.points, state.links)
  state.points = gatherPointGroups(1, state.points)
  // calc points groups
  // R.map(p => console.log(p.id, p.links), state.points)
  // list of all point pairs for repulsing force -- save it in state for saving calculations
  state.pairs = R.map(
    // its a fake link, just to make funcs types simplier
    ([id1, id2]) => ({ p1: id1, p2: id2, length: 0, contract: 0 }),
    U.noOrderNoSameValuesPairs(R.map(p => p.id, pointsArray))
  )
  initDrawings(state.base_container, pointsArray)
  addCircleMask(state.base_container, state.size / 2, { x: 0, y: 0 }, CIRCLE_MASK_COLOR)
  return state
}

const gatherPointLinks = (points: Points, links: Array<Link>): Points => R.reduce((acc, link) => {
  const p1 = acc[link.p1]
  const p2 = acc[link.p2]
  return { ...acc, [p1.id]: { ...p1, links: [...p1.links, p2.id] }, [p2.id]: { ...p2, links: [...p2.links, p1.id] } }
}, points, links)

export const gatherPointGroups = (curGroup: number, points: Points): Points => {
  const pointsArray = R.values(points)
  const noGroupPoints = R.filter(p => p.group === 0, pointsArray)
  if (R.length(noGroupPoints) === 0) {
    return points
  }
  const curGroupPoints = R.filter(p => p.group === curGroup, pointsArray)
  if (R.length(curGroupPoints) === 0) {
    const p = noGroupPoints[0]
    return gatherPointGroups(curGroup, { ...points, [p.id]: { ...p, group: curGroup } })
  }
  const curPointLinks = R.chain(p => p.links, curGroupPoints)
  const pointIdsToSet = R.indexBy(e => e, R.filter(pid => points[pid].group === 0, curPointLinks))
  if (R.equals(pointIdsToSet, {})) {
    return gatherPointGroups(curGroup + 1, points)
  }
  const newPoints = R.map(p => {
    if (pointIdsToSet[p.id]) {
      return { ...p, group: curGroup }
    }
    return p
  }, points)
  return gatherPointGroups(curGroup, newPoints)
}

const initDrawings = (container, points) => {
  container.removeChildren()
  const linksContainer = new Graphics()
  linksContainer.name = 'linksContainer'
  container.addChild(linksContainer)
  // points after links! emulation of zIndex. PIXI zIndex doesnot work, despite of sortableChildren = true. dunno why
  points.forEach(p => {
    const graphics = new Graphics()
    graphics.name = drawerPointId(p)
    container.addChild(graphics)
  })
}

const drawerPointId = point => `p-${point.id}`
// const drawerLinkId = link => `l-${link.p1}-${link.p2}`

const redraw = (oldState: State): State => {
  const state: State = { ...oldState }
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
  if (maxSpeedQuad(state.points) <= MAX_SPEED_QUAD_TRIGGER) {
    // we find crossing links for only one link a tick -- to save speed and spread calculations thru ticks
    const curLink = state.links[state.ticks % state.links.length]
    state.links = findAndHandleCrossingLinks(curLink, state.links, state.points)
  }
  state.links = handleContractedLinks(state.links)
  const pointsFromContractedLinks = R.indexBy(e => e, R.uniq(R.flatten(R.map(({ p1, p2, contract }) => {
    return contract ? [p1, p2] : []
  }, state.links))))
  state.points = R.map(p => ({ ...p, contract: !!pointsFromContractedLinks[p.id] }), state.points)
  redrawGraphics(state.base_container, state.points, state.links, state.colors, state.colorStep)
  // console.log(state.ticks)
  if ((state.ticks + 1) % REBUILD_EVERY === 0) {
    return initGraphics(state)
  }
  return state
}

// calc color channel
const ccc = (orig: number, diff: number): number => (orig === 0 ? 0 : Math.round(orig + diff))

const redrawGraphics = (container, points: Points, links: Array<Link>, colors: Array<ChannelMatrix>, colorStep) => {
  const pointDist = R.map(p => {
    const { radius } = U.toPolarCoords(p)
    const colorDiff = COLOR_BRIGHTEN_MAX - radius * colorStep
    const ci = p.group % R.length(colors)
    const color = [ccc(colors[ci].r, colorDiff), ccc(colors[ci].g, colorDiff), ccc(colors[ci].b, colorDiff)]
    const graphics = container.getChildByName(drawerPointId(p))
    if (!graphics) {
      throw new Error(`point graphics not found by id ${p.id}`)
    }
    graphics.x = p.x
    graphics.y = p.y
    drawDottedPoint(graphics, p.contract ? [150, 0, 0] : color, 1.5)
    return { radius, color }
  }, points)
  const linksContainer = container.getChildByName('linksContainer')
  linksContainer.removeChildren()
  links.forEach(l => {
    const [p1, p2] = getLinkPoints(l, points)
    const color = pointDist[l.p1].radius > pointDist[l.p2].radius ? pointDist[l.p1].color : pointDist[l.p2].color
    drawLine(linksContainer, color, 0.75, p1, p2)
  })
}

const handleContractedLinks = (links: Array<Link>): Array<Link> => R.map(l => {
  if (l.contract === 0) {
    return l
  }
  const diff = 1 / CONTRACT_STEPS
  if (l.length > LINKS_LENGTH) {
    return { ...l, contract: 0, length: LINKS_LENGTH }
  }
  const toAddMul = l.contract > CONTRACT_STEPS ? diff : -0.025 * diff
  return { ...l, contract: l.contract + 1, length: l.length + toAddMul * LINKS_LENGTH }
}, links)

const findAndHandleCrossingLinks = (link: Link, links: Array<Link>, points: Points): Array<Link> => R.map(l => {
  if (l.contract) {
    return l
  }
  if (link.p1 === l.p1 || link.p1 === l.p2 || link.p2 === l.p1 || link.p2 === l.p2) {
    return l
  }
  const [p11, p12] = getLinkPoints(link, points)
  const [p21, p22] = getLinkPoints(l, points)
  // we checked edges upper
  if (U.intervalsCrossPoint(p11, p12, p21, p22)) {
    // console.log(`${link.p1}-${link.p2} -- ${l.p1}-${l.p2}`)
    return { ...l, contract: 1 }
  }
  return l
}, links)

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

const calcAllRepulsingForce = (points, pairs, dlQuad) => vectorsByLinks(points, pairs, allRepulsingForce, dlQuad)
const calcSpringForce = (points, links) => vectorsByLinks(points, links, springForce)

const allRepulsingForce = (p1, p2, quadDistance) => {
  if (p1.contract || p2.contract) {
    return 0
  }
  return REPULSING_FORCE_MUL * LINKS_LENGTH / quadDistance
}

const springForce = (p1, p2, quadDistance, link) => {
  const CONTRACT_MUL = link.contract ? 5 : 1
  // let it be linear for now
  return CONTRACT_MUL * FORCE_MUL * ((link.length ** 2) - quadDistance) / quadDistance
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

export const init = (): InitDrawerResult => initDrawer('circle', () => [], initGraphics, redraw)
