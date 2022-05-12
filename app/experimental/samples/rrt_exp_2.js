// @flow

/**
 * смысл в том чтобы попробовать пересоединить точки в rrt-диаграмме другим способом
 * тогда они по идее могут образовать больше одного дерева
 * раскрашиваем деревья в разные цвета
 * на данный момент похоже что граф соединения точек все равно воссоздается таким же как был в rrt-диаграмме
 * надо попробовать другой подход -- каждая точка выбирает соседей и линкуется с одним случайным
 */

import * as PIXI from 'pixi.js'
import random from 'random'
import seedrandom from 'seedrandom'

import * as Color from 'common/color'
import * as U from 'common/utils'
import * as R from 'ramda'
// import { addCircleMask } from 'experimental/drawing_functions'
import { startDrawer } from 'experimental/drawer'
import { generate } from 'common/rrt_diagram'
import { randomPointPolar } from 'experimental/random_points'

import type { DrawerState } from 'experimental/drawer'
// import type { RRTDiagram, RRTPoint } from 'common/rrt_diagram'

import type { XYPoint } from 'common/utils'

const STEP = 7
const REBUIND_AFTER = 5000
const LINK_LENGTH_MUL = 1.05

type PointId = string
type Point = { ...XYPoint, id: PointId }
type Links = Array<[PointId, PointId]>

type State = {|
  ...DrawerState,
  // rrt: RRTDiagram,
  points: { [PointId]: Point },
  links: Links,
  graphics: Object,
|}

const initGraphics = (state: State): State => {
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.base_container.removeChildren()
  const graphics = new PIXI.Graphics()
  state.base_container.addChild(graphics)
  // addCircleMask(graphics, state.size / 2, { x: 0, y: 0 }, [0, 150, 0])
  const rrt = generate(STEP, randomPointFunc(state.size / 2), [U.fromPolarCoords(randomPointPolar(state.size / 2))])
  const points = R.indexBy(R.prop('id'), R.map(({ x, y, index }) => ({ x, y, id: `p-${index}` }), rrt))
  const links = buildLinks(R.values(points))
  R.values(points).forEach(point => drawPoint(graphics, point))
  drawLinks2(links, points, graphics)
  return {
    ...state,
    graphics,
    points,
    links,
  }
}

const randomPointFunc = (radius: number) => () => U.fromPolarCoords(randomPointPolar(radius))

const redraw = (state: State): State => {
  if ((state.ticks + 1) % REBUIND_AFTER === 0) {
    return initGraphics(state)
  }
  return state
}

const buildLinks = (points: Array<Point>): Links => U.noOrderNoSameValuesPairs(points).map(([p1, p2]) => {
  if (((p1.x - p2.x) ** 2) + ((p1.y - p2.y) ** 2) <= LINK_LENGTH_MUL * (STEP ** 2)) {
    return [p1.id, p2.id]
  }
  // $FlowIgnore
  return null
}).filter(e => e)

const drawPoint = (graphics: Object, point: Point): void => {
  graphics.beginFill(Color.to_pixi([0, 150, 0]), 1)
  graphics.drawCircle(point.x, point.y, 0.5)
  graphics.endFill()
}

const drawLinks2 = (links, points, graphics) => {
  graphics.lineStyle(0.5, Color.to_pixi([0, 150, 0]), 1)
  links.forEach(([id1, id2]) => {
    const p1 = points[id1]
    const p2 = points[id2]
    graphics.moveTo(p1.x, p1.y)
    graphics.lineTo(p2.x, p2.y)
  })
}

/* eslint-disable-next-line no-unused-vars */
const drawLinks = (links, points, graphics, curPoints = [], curColor = null) => {
  if (links.length === 0) {
    return
  }
  if (curPoints.length === 0) {
    // $FlowIgnore
    const [[p1, p2], ...rest] = links
    const randColor = [randColorChannel(), randColorChannel(), randColorChannel()]
    console.log('rand color', randColor)
    return drawLinks(rest, points, graphics, [p1, p2], randColor)
  }
  const [curLinks, rest] = R.partition(link => R.intersection(link, curPoints).length, links)
  const pIfNotCur = p => (R.includes(p, curPoints) ? [] : p)
  const nextPoints = R.chain(([p1, p2]) => [pIfNotCur(p1), pIfNotCur(p2)], curLinks)
  // $FlowIgnore
  graphics.lineStyle(0.5, Color.to_pixi(curColor), 1)
  curLinks.forEach(([id1, id2]) => {
    const p1 = points[id1]
    const p2 = points[id2]
    graphics.moveTo(p1.x, p1.y)
    graphics.lineTo(p2.x, p2.y)
  })

  return drawLinks(rest, points, graphics, nextPoints, curColor)
}

const randColorChannel = () => 10 * random.int(0, 15)

export const init = (): void => startDrawer('circle', initGraphics, redraw)
