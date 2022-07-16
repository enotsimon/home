// @flow
// идея была в том что мы делаем карту из точек и их связей. связи как контуры материков
// предполагалось что потом надо находить замкнутые контуры и закрашивать их
// так же предпологалось некое сглаживание засчет второй генерации точек вокруг первой
// но я решил что лучше попробовать динамический подход в dots_map_dynamic --
// добавление точек по одной а не все разом как тут
import * as Color from 'common/color'
import * as PIXI from 'pixi.js'
import * as R from 'ramda'
import * as U from 'enot-simon-utils/lib/utils'
import random from 'random'
import seedrandom from 'seedrandom'

import { startDrawer } from 'experimental/drawer'
import { addDotsIntoCircleWithMinDistance } from 'experimental/random_points'
import type { Dot, Dots as OrigDots, DotId } from 'experimental/random_points'
import type { DrawerState } from 'experimental/drawer'

type Dots = OrigDots<Dot>
type DotsState = {|
  ...DrawerState,
  dots: Dots,
  links: Array<Link>,
  // note they are separated from 'buisness' objects
  dotsGraphics: Array<Object>, // PIXI graphics
|}

type Link = [DotId, DotId]

// const PAIRS_PART_BASIC = 0.25
// const PAIRS_PART_RMD = 0.5
// const RMD_PERCENTILE = 0.6
const PAIRS_PART_RMC = 0.8
const RMC_PERCENTILE = 0.85
const DISTANCE_LIMIT_MUL = 0.05
const DOTS_COUNT = 100

const initGraphics = (oldState: DrawerState): DotsState => {
  const state = { ...oldState }
  const seed = Date.now()
  random.use(seedrandom(seed))
  // TODO min distance between
  state.dots = addDotsIntoCircleWithMinDistance(state.size / 2, DISTANCE_LIMIT_MUL * state.size, DOTS_COUNT)
  // state.links = connectDotsBasic(state.dots, PAIRS_PART_BASIC)
  // state.links = connectDotsRemoveMostDistant(state.dots, PAIRS_PART_RMD, RMD_PERCENTILE)
  state.links = connectDotsRemoveMostConnected(state.dots, PAIRS_PART_RMC, RMC_PERCENTILE)
  console.log('DOTS COUNT', R.keys(state.dots).length, 'LINKS COUNT', state.links.length)
  state.dotsGraphics = drawDots(state.dots, state.base_container)
  // TODO add this crap to state
  drawLines(state.dots, state.links, state.base_container)

  return state
}

const redraw = (state: DotsState): DotsState => {
  return state
}

const connectDotsBasic = (dots: Dots, pairsPart: number): Array<Link> => {
  // note -shuffle them at once
  const allPairs = U.shuffle(R.filter(([d1, d2]) => d1 !== d2, U.pairs(R.keys(dots))))
  const pairs = R.take(Math.ceil(pairsPart * allPairs.length), allPairs)
  let links = []
  pairs.forEach(([d1, d2]) => {
    // $FlowIgnore
    const cpl = R.find(([ed1, ed2]) => !!U.intervalsCrossPointNoEdge(dots[d1], dots[d2], dots[ed1], dots[ed2]), links)
    if (!cpl) {
      links = [...links, [d1, d2]]
    }
  })
  return links
}

/* eslint-disable-next-line no-unused-vars */
const connectDotsRemoveMostDistant = (dots: Dots, pairsPart: number, percentile: number): Array<Link> => {
  const links = connectDotsBasic(dots, pairsPart)
  const lwd = links.map(([d1, d2]) => [d1, d2, U.distance(dots[d1], dots[d2])])
  const limit = R.pipe(
    R.map(([,, d]) => d),
    R.uniq,
    R.sort((e1, e2) => e1 - e2),
    list => R.nth(Math.ceil(percentile * list.length))(list)
  )(lwd)
  console.log('CUT LINKS LONGER THAN', limit)
  return lwd.filter(([,, dis]) => dis < limit).map(([d1, d2]) => [d1, d2])
}

const connectDotsRemoveMostConnected = (dots: Dots, pairsPart: number, percentile: number): Array<Link> => {
  const links = connectDotsBasic(dots, pairsPart)
  const counters = links.reduce((acc, [d1, d2]) => ({ ...acc, [d1]: (acc[d1] || 0) + 1, [d2]: (acc[d2] || 0) + 1 }), {})
  const limit = R.pipe(
    R.values,
    R.sort((e1, e2) => e1 - e2),
    list => R.nth(Math.ceil(percentile * list.length))(list)
  )(counters)
  console.log('CUT LINKS CONNECTED TO MORE THAN', limit)
  return links.filter(([d1, d2]) => counters[d1] < limit && counters[d2] < limit)
}

const drawLines = (dots: Dots, links: Array<Link>, container: Object): void => {
  links.forEach(([d1, d2]) => {
    const graphics = new PIXI.Graphics()
    graphics.lineStyle(0.25, Color.to_pixi([255, 255, 255]))
    graphics.moveTo(dots[d1].x, dots[d1].y)
    graphics.lineTo(dots[d2].x, dots[d2].y)
    container.addChild(graphics)
  })
}

const drawDots = (dots: Dots, container: Object): Array<Object> => {
  // $FlowIgnore
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

export const init = (): void => startDrawer('circle', initGraphics, redraw)
