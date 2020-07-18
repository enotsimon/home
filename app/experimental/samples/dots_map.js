// @flow
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import * as U from 'common/utils'
import random from 'random'
import seedrandom from 'seedrandom'

import { initDrawer } from 'experimental/drawer'
import type { DrawerState, DrawerOnTickCallback } from 'experimental/drawer'

type DotsState = {|
  ...DrawerState,
  dots: Dots,
  links: Array<Link>,
  // note they are separated from 'buisness' objects
  dotsGraphics: Array<Object>, // PIXI graphics
|}

type DotId = number
type Dot = {
  id: DotId,
  angle: number,
  radius: number,
  // store them cause too ofter we need to convert from polar
  x: number,
  y: number,
}
type Dots = {[DotId]: Dot}
type Link = [DotId, DotId]

const PAIRS_PART = 0.25
const DISTANCE_LIMIT_MUL = 0.05
const DOTS_COUNT = 100

const initGraphics = (oldState: DrawerState): DotsState => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  // TODO min distance between
  state.dots = recursiveAddDots(state.size / 2, DOTS_COUNT)
  state.links = connectDotsBasic(state.dots, PAIRS_PART)
  console.log('DOTS COUNT', R.keys(state.dots).length, 'LINKS COUNT', state.links.length)
  state.dotsGraphics = drawDots(state.dots, state.base_container)
  // TODO add this crap to state
  drawLines(state.dots, state.links, state.base_container)

  return state
}

const redraw = (state: DotsState): DotsState => {
  return state
}

// TODO move it to utils like random-points-generator
const recursiveAddDots = (scale: number, limit: number, dots = {}, cycles: number = 0): Dots => {
  const theVeryDistanceLimit = DISTANCE_LIMIT_MUL * scale
  if (limit === 0) {
    return dots
  }
  if (cycles === 1000) {
    throw new Error('too many cycles')
  }
  // TODO stupid way, but -- dont care
  const x = random.int(-scale, scale)
  const y = random.int(-scale, scale)
  const { angle, radius } = U.toPolarCoords({ x, y })
  // theVeryDistanceLimit i added because of circle contour
  if (radius > (scale - theVeryDistanceLimit)) {
    return recursiveAddDots(scale, limit, dots, cycles)
  }
  const tooCloseToBorder = R.find(d => U.distance(d, { x, y }) <= theVeryDistanceLimit)(R.values(dots))
  if (tooCloseToBorder) {
    return recursiveAddDots(scale, limit, dots, cycles + 1)
  }
  const dot = { id: limit, angle, radius, x, y }
  return recursiveAddDots(scale, limit - 1, { ...dots, [limit]: dot }, 0)
}

/* eslint-disable-next-line no-unused-vars */
const connectDotsBasic = (dots: Dots, pairsPart: number): Array<Link> => {
  // note -shuffle them at once
  const allPairs = U.shuffle(R.filter(([d1, d2]) => d1 !== d2, U.pairs(R.keys(dots))))
  const pairs = R.take(Math.ceil(pairsPart * allPairs.length), allPairs)
  let links = []
  pairs.forEach(([d1, d2]) => {
    const cpLink = R.find(([ed1, ed2]) => U.intervalsCrossPointNoEdge(dots[d1], dots[d2], dots[ed1], dots[ed2]))(links)
    if (!cpLink) {
      links = [...links, [d1, d2]]
    }
  })
  return links
}

/* eslint-disable-next-line no-unused-vars */
const drawLines = (dots: Array<Dot>, links: Array<Link>, container: Object): void => {
  links.forEach(([d1, d2]) => {
    const graphics = new PIXI.Graphics()
    graphics.lineStyle(0.25, Color.to_pixi([255, 255, 255]))
    graphics.moveTo(dots[d1].x, dots[d1].y)
    graphics.lineTo(dots[d2].x, dots[d2].y)
    container.addChild(graphics)
  })
}

const drawDots = (dots: Array<Dot>, container: Object): Array<Object> => {
  return R.map(dot => {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(Color.to_pixi([255, 255, 255]), 1)
    graphics.drawCircle(0, 0, 1)
    graphics.endFill()
    graphics.x = dot.x
    graphics.y = dot.y
    container.addChild(graphics)
    return graphics
  })(dots)
}

/* no needed
const initPairsGenerator = <T: any>(arr: Array<T>): () => ?[T, T] => {
  if (R.uniq(arr).length !== arr.length) {
    throw new Error('initPairsGenerator should take array of uniq elements')
  }
  if (arr.length === 0) {
    throw new Error('initPairsGenerator cannot take zero-sized arrays')
  }
  let cura1
  let cura2
  let a1 = U.shuffle(arr)
  // i dunno whats wrong with that fucken babel but if i uncomment next line he says its syntax error
  // [cura1, ...a1] = a1
  const pizdec = R.splitAt(1, a1)
  cura1 = pizdec[0][0]
  a1 = pizdec[1]
  let a2 = U.shuffle(R.without([cura1], arr))
  // console.log('IN', cura1, a1.join(','), a2.join(','))
  return () => {
    // console.log('CY', cura1, cura2, a1.join(','), a2.join(','))
    if (a2.length === 0) {
      if (a1.length === 0) {
        return null
      }
      [cura1, ...a1] = a1
      a2 = U.shuffle(R.without([cura1], arr))
      // console.log('ROT', cura1, cura2, a1.join(','), a2.join(','))
    }
    [cura2, ...a2] = a2
    return [cura1, cura2]
  }
}
*/

export const init = (drawerOnTickCallback: DrawerOnTickCallback) => initDrawer(
  'circle',
  () => [],
  initGraphics,
  redraw,
  drawerOnTickCallback,
)
