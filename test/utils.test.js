// @flow
/* eslint-env mocha */
import { describe, it } from 'mocha'
import { assert } from 'chai'
import * as R from 'ramda'

import { angleBy3Points, randomPointPolar, fromPolarCoords } from '../app/common/utils'

describe('angleBy3Points', () => {
  const samples = [
    { a: { x: -1, y: 0 }, b: { x: 0, y: 0 }, c: { x: 1, y: 0 }, expect: Math.PI },
    { a: { x: -1, y: 0 }, b: { x: 0, y: 0 }, c: { x: 0, y: -1 }, expect: Math.PI / 2 },
    { a: { x: -1, y: 0 }, b: { x: 0, y: 0 }, c: { x: 0, y: -1 }, expect: Math.PI / 2 },
    { a: { x: -1, y: 0 }, b: { x: 0, y: 0 }, c: { x: -1, y: -1 }, expect: Math.PI / 4 },
    { a: { x: -1, y: 0 }, b: { x: 0, y: 0 }, c: { x: 1, y: -1 }, expect: Math.PI / 2 + Math.PI / 4 },
  ]

  it('calc angles by given samples', () => {
    samples.forEach(sample => {
      const result = angleBy3Points(sample.a, sample.b, sample.c)
      assert.equal(result, sample.expect)
    })
  })
})

describe('randomPointPolar', () => {
  it('should generate points at least in specific range', () => {
    const maxRadius = 100
    const points = R.map(() => {
      const { angle, radius } = randomPointPolar(maxRadius)
      return fromPolarCoords(angle, radius)
    })(R.range(1, 500))
    points.forEach(({ x, y }) => {
      assert.isAtMost(x, maxRadius, 'x > radius !!')
      assert.isAtLeast(x, -maxRadius, 'x < -radius !!')
      assert.isAtMost(y, maxRadius, 'y > radius !!')
      assert.isAtLeast(y, -maxRadius, 'y < -radius !!')
    })
  })
})
