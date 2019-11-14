// @flow
import Util from 'common/util'
import * as R from 'ramda'

type Byte = number
export type ChannelMatrix = { r: Byte, g: Byte, b: Byte }

export default class Color {
  static random_near([r, g, b], step = 10, count = 2) {
    return Color.for_rgb([r, g, b], e => Color.random_channel(e, step, count))
  }

  static random([r, g, b], step = 10) {
    return Color.for_rgb([r, g, b], e => Color.random_by_floor(e, step))
  }

  static brighter([r, g, b], step = 10) {
    return [r, g, b].map(e => Math.min(e + step, 255))
  }

  static darker([r, g, b], step = 10) {
    return [r, g, b].map(e => Math.max(e - step, 0))
  }

  static to_pixi([r, g, b]) {
    /* eslint-disable-next-line no-bitwise */
    return (r << 16) + (g << 8) + b
  }

  // PRIVATE
  static for_rgb([r, g, b], func) {
    return [func(r), func(g), func(b)]
  }

  // PRIVATE
  static random_channel(base, step, count) {
    const rand = step * Util.rand(-count, count)
    const res = base + rand
    return res > 255 ? 255 : res < 0 ? 0 : res
  }

  // PRIVATE
  static random_by_floor(floor, step) {
    return floor - step * Util.rand(0, floor / step | 0)
  }

  static allChannelMatrixes(order: number = 1, withMonochrome: boolean = false): Array<ChannelMatrix> {
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
}
