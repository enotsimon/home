// @flow
// идея была в том что мы делаем карту из точек и их связей. связи как контуры материков
// предполагалось что потом надо находить замкнутые контуры и закрашивать их
// так же предпологалось некое сглаживание засчет второй генерации точек вокруг первой
// но я решил что лучше попробовать динамический подход в dots_map_dynamic --
// добавление точек по одной а не все разом как тут
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import * as U from 'common/utils'
import random from 'random'
import seedrandom from 'seedrandom'

import { initDrawer } from 'experimental/drawer'
import { addDotsIntoCircleWithMinDistance } from 'experimental/random_points'
import type { DrawerState, DrawerOnTickCallback } from 'experimental/drawer'
import type { Dot as OrigDot, DotId } from 'experimental/random_points'

type DotsState = {|
  ...DrawerState,
  dots: Dots,
  links: Array<Link>,
  // note they are separated from 'buisness' objects
  graphics: Object, // PIXI graphics
  counter: number,
|}

type Dot = {| ...OrigDot, counter: number |}
type Dots = {[DotId]: Dot}
type Link = [DotId, DotId]

const THROTTLE = 5
const LINKS_AFTER_TICKS = 5
const DISTANCE_LIMIT_MUL = 0.05
const DOTS_LIMIT = 100
const LINK_LENGTH_LIMIT = 0.1
const LINKS_COUNT_LIMIT = 2 // meant not all, but links built _from_ dot
const LINKS_MAX_RETRY = 10

const initGraphics = (oldState: DrawerState): DotsState => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  state.counter = 0
  state.dots = {}
  state.links = []
  state.graphics = new PIXI.Graphics()
  state.base_container.addChild(state.graphics)
  return state
}

const redraw = (oldState: DotsState): DotsState => {
  if (oldState.ticks % THROTTLE !== 0) {
    return oldState
  }
  const state = { ...oldState }
  state.counter += 1
  if (R.keys(state.dots).length < DOTS_LIMIT) {
    const dots = addDotsIntoCircleWithMinDistance(state.size / 2, DISTANCE_LIMIT_MUL * state.size, 1, state.dots)
    state.dots = R.map(d => ({ ...d, counter: d.counter || state.counter }))(dots)
  }
  const dotsToAddLinks = R.filter(d => state.counter - d.counter === LINKS_AFTER_TICKS)(R.values(state.dots))
  state.links = R.reduce(
    (links, dot) => addRandomLinksToOneDot(dot, links, state.dots, state.size),
    state.links,
    dotsToAddLinks
  )
  state.dots = removeLonelyDots(state.dots, state.links, state.counter)
  state.graphics.removeChildren()
  drawDots(state.dots, state.graphics)
  drawLines(state.dots, state.links, state.graphics)
  return state
}

const addRandomLinksToOneDot = (dot: Dot, links: Array<Link>, dots: Dots, mapSize: number): Array<Link> => {
  const possibleDots = R.pipe(
    R.values,
    R.filter(d => d.id !== dot.id && U.distance(d, dot) < LINK_LENGTH_LIMIT * mapSize),
    U.shuffle
  )(dots)
  return addLinks(dot, possibleDots, links, dots, LINKS_COUNT_LIMIT, LINKS_MAX_RETRY)
}

// ? should we set retry = LINKS_MAX_RETRY on every success link? no for now
// TODO retry must be part of all cur links, for example Math.ceil(retry * links.length)
const addLinks = (dotFrom, [dotTo, ...rest], links, dots, limit, retry) => {
  if (!dotTo) {
    return links
  }
  if (limit === 0) {
    return links
  }
  if (retry === 0) {
    return links
  }
  if (isCrossing(dotFrom, dotTo, links, dots)) {
    return addLinks(dotFrom, rest, links, dots, limit, retry - 1)
  }
  return addLinks(dotFrom, rest, [...links, [dotFrom.id, dotTo.id]], dots, limit - 1, retry)
}

const isCrossing = (dotFrom: Dot, dotTo: Dot, links: Array<Link>, dots: Dots): boolean => {
  return !!R.find(([ed1, ed2]) => U.intervalsCrossPointNoEdge(dotFrom, dotTo, dots[ed1], dots[ed2]))(links)
}

const removeLonelyDots = (dots: Dots, links: Array<Link>, counter: number): Dots => {
  const dotsToRemovePre = R.without(R.uniq(R.reduce((acc, [d1, d2]) => [...acc, d1, d2], [], links)), R.keys(dots))
  const dotIdsToRemove = R.filter(id => dots[id].counter < (counter - 2 * LINKS_AFTER_TICKS))(dotsToRemovePre)
  return R.omit(dotIdsToRemove, dots)
}

const drawLines = (dots: Dots, links: Array<Link>, container: Object): void => R.forEach(([d1, d2]) => {
  const graphics = new PIXI.Graphics()
  graphics.lineStyle(0.25, Color.to_pixi([255, 255, 255]))
  graphics.moveTo(dots[d1].x, dots[d1].y)
  graphics.lineTo(dots[d2].x, dots[d2].y)
  container.addChild(graphics)
})(links)

const drawDots = (dots: Dots, container: Object): void => R.forEach(dot => {
  const graphics = new PIXI.Graphics()
  graphics.beginFill(Color.to_pixi([255, 255, 255]), 1)
  graphics.drawCircle(0, 0, 1)
  graphics.endFill()
  graphics.x = dot.x
  graphics.y = dot.y
  container.addChild(graphics)
  return graphics
})(R.values(dots))

export const init = (drawerOnTickCallback: DrawerOnTickCallback) => initDrawer(
  'circle',
  () => [],
  initGraphics,
  redraw,
  drawerOnTickCallback,
)
