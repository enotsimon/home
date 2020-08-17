// @flow
/**
 * это корочи как d3.force -- пружинки между точками и точки должны разворачиваться под действием
 * силы пружинок
 * TODO
 * - сейчас нет ни скорости ни ускорения, вычисляется сдвиг координат, поэтому нет инерции, надо добавить
 * - нужна сила которая отталкивает точки др от др чтобы они разворачивались в максимально не пересекающийся граф
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
import { returnPointsToCircle } from 'experimental/circle_border'

import type { DrawerState } from 'experimental/drawer'
import type { XYPoint } from 'common/utils'

// type Vector = XYPoint
type PointId = number
type Point = {|
  ...XYPoint,
  id: PointId,
|}

type Link = {
  p1: PointId,
  p2: PointId,
  length: number,
}

type State = {|
  ...DrawerState,
  points: Array<Point>,
  links: Array<Link>,
|}

// const FORCE_STRENGTH = 0.05
const COUNT_POINTS = 25
const THROTTLE = 2
// const LENGTH_MAX_MUL = 0.3
// const LENGTH_MIN_MUL = 0.1

const initGraphics = (oldState: DrawerState): State => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.points = R.map(id => {
    const { x, y } = U.fromPolarCoords(randomPointPolar(state.size / 2))
    return { id, x, y }
  })(R.range(0, COUNT_POINTS))
  // each point has one link to ramdom another one
  state.links = R.reduce((accLinks, p) => {
    const possibleTargetPoints = removeSelfAndBackLinks(state.points, accLinks, p)
    if (possibleTargetPoints.length === 0) {
      throw new Error('no possible target points')
    }
    const targetPoint = U.randElement(possibleTargetPoints)
    // FIXME length: 10 its first simple way
    return [...accLinks, { p1: p.id, p2: targetPoint.id, length: 25 }]
  }, [], state.points)
  console.log('LINKS', state.links)
  initDrawings(state.base_container, state.points)
  addCircleMask(state.base_container, state.size / 2)
  return state
}

const removeSelfAndBackLinks = (points, links, point): Array<Point> => {
  const badIdsFromLinks = R.chain(l => ((l.p1 === point.id || l.p2 === point.id) ? [l.p1, l.p2] : []), links)
  const badIds = R.uniq([...badIdsFromLinks, point.id])
  return R.filter(p => !R.contains(p.id, badIds), points)
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
  graphics.drawCircle(0, 0, 2)
  graphics.endFill()
  graphics.x = point.x
  graphics.y = point.y
  return graphics
}

const redraw = (oldState: State): State => {
  const state = { ...oldState }
  if (state.ticks % THROTTLE !== 0) {
    return state
  }
  state.points = calcForceMovement(state.points, state.links, state.size / 2)
  // state.points = calcCircleBorderForceAcceleration(state.points, state.size / 2)
  // state.points = state.points.map(p => ({ ...p, x: p.x + p.speed.x, y: p.y + p.speed.y }))
  // naive circle border -- just return point back if they out of circle
  state.points = returnPointsToCircle(state.points, state.size / 2)
  redrawGraphics(state.base_container, state.points, state.links)
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

const getLinkPoints = (link, points) => {
  const p1 = R.find(p => p.id === link.p1, points)
  const p2 = R.find(p => p.id === link.p2, points)
  if (!p1 || !p2) {
    throw new Error(`point not found by id ${p1 ? link.p2 : link.p1}`)
  }
  return [p1, p2]
}

const calcForceMovement = (points: Array<Point>, links: Array<Link>, size: number): Array<Point> => {
  const FORCE_MUL = 0.0001 * size
  const vectors = R.chain(link => {
    const [p1, p2] = getLinkPoints(link, points)
    const distance = U.distance(p1, p2)
    // let it be linear for now
    const positionDiff = FORCE_MUL * (link.length - distance) / distance
    const pseudoPoint = { x: (p1.x - p2.x) * positionDiff, y: (p1.y - p2.y) * positionDiff }
    // console.log('DUI', distance, link.length, pseudoPoint)
    const p1Vector = { point: p1.id, x: pseudoPoint.x, y: pseudoPoint.y }
    const p2Vector = { point: p2.id, x: -pseudoPoint.x, y: -pseudoPoint.y }
    // console.log('PP', pseudoPoint, positionDiff)
    return [p1Vector, p2Vector]
  }, links)
  // console.log('vectors', vectors)
  const vectorsByIds = R.reduce((acc, v) => {
    return { ...acc, [v.point]: [...(acc[v.point] || []), v] }
  }, {}, vectors)
  return R.map(point => {
    const myVectors = vectorsByIds[point.id]
    if (!myVectors) {
      console.log(`strange but seems like point ${point.id} has no links`)
      return point
    }
    return R.reduce((p, vector) => {
      // console.log(`point (${p.x}, ${p.y}) my vector (${vector.x}, ${vector.y})`)
      return { ...p, x: p.x + vector.x, y: p.y + vector.y }
    }, point, myVectors)
  }, points)
}

export const init = () => initDrawer('circle', () => [], initGraphics, redraw)
