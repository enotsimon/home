// @flow
import Util from 'common/util'
import * as R from 'ramda'
// import random from 'random'

type Byte = number // 0 -- 255
export type ChannelMatrix = { r: Byte, g: Byte, b: Byte }
export type RGBArray = [Byte, Byte, Byte]


export const random_near = ([r, g, b]: RGBArray, step: number = 10, count: number = 2): RGBArray => {
  return forRGB([r, g, b], e => randomChannel(e, step, count))
}

export const random = ([r, g, b]: RGBArray, step: number = 10): RGBArray => {
  return forRGB([r, g, b], e => randomByFloor(e, step))
}

export const brighter = ([r, g, b]: RGBArray, step: number = 10): RGBArray => {
  return forRGB([r, g, b], e => Math.min(e + step, 255))
}

export const darker = ([r, g, b]: RGBArray, step: number = 10): RGBArray => {
  return forRGB([r, g, b], e => Math.max(e - step, 0))
}

export const to_pixi = ([r, g, b]: RGBArray): number => {
  /* eslint-disable-next-line no-bitwise */
  return (r << 16) + (g << 8) + b
}

export const allChannelMatrixes = (order: number = 1, withMonochrome: boolean = false): Array<ChannelMatrix> => {
  if (order < 0 || order > 8) {
    return [] // ???
  }
  const multis = [1, ...R.map(n => 256 / (2 ** n), R.reverse(R.range(0, order + 1)))]
  // console.log('MUL', multis)
  const all = R.chain(
    r => R.chain(
      g => R.chain(
        b => ({ r: r - 1, g: g - 1, b: b - 1 })
      )(multis)
    )(multis)
  )(multis)
  if (withMonochrome) {
    return all
  }
  return R.filter(({ r, g, b }) => !(r === g && r === b && g === b), all)
}


const forRGB = ([r, g, b], func) => [func(r), func(g), func(b)]

const randomChannel = (base, step, count) => {
  const rand = step * Util.rand(-count, count)
  const res = base + rand
  /* eslint-disable-next-line no-nested-ternary */
  return res > 255 ? 255 : res < 0 ? 0 : res
}

/* eslint-disable-next-line no-bitwise */
const randomByFloor = (floor: number, step: number): number => floor - step * Util.rand(0, floor / step | 0)
