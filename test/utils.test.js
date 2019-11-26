// @flow
/* eslint-env mocha */
import { describe, it } from 'mocha'
import { assert } from 'chai'
import * as R from 'ramda'

import * as U from '../app/common/utils'

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
      const result = U.angleBy3Points(sample.a, sample.b, sample.c)
      assert.equal(result, sample.expect)
    })
  })
})

describe('randomPointPolar', () => {
  it('should generate points at least in specific range', () => {
    const maxRadius = 100
    const points = R.map(() => {
      const { angle, radius } = U.randomPointPolar(maxRadius)
      return U.fromPolarCoords(angle, radius)
    })(R.range(1, 500))
    points.forEach(({ x, y }) => {
      assert.isAtMost(x, maxRadius, 'x > radius !!')
      assert.isAtLeast(x, -maxRadius, 'x < -radius !!')
      assert.isAtMost(y, maxRadius, 'y > radius !!')
      assert.isAtLeast(y, -maxRadius, 'y < -radius !!')
    })
  })
})

describe('findNearestNode', () => {
  it('should find nearest point negative values', () => {
    const result = U.findNearestPoint({ x: 2, y: 2 }, [{ x: -1, y: -1 }, { x: 10, y: 10 }])
    const expect = { x: -1, y: -1 }
    assert.deepEqual(result, expect)
  })
  it('should find nearest point exact values', () => {
    const result = U.findNearestPoint({ x: 2, y: 2 }, [{ x: 2, y: 2 }, { x: 10, y: 10 }])
    const expect = { x: 2, y: 2 }
    assert.deepEqual(result, expect)
  })
  it('should find nearest point zero values', () => {
    const result = U.findNearestPoint({ x: 0, y: 0 }, [{ x: 2, y: 2 }, { x: 10, y: 10 }])
    const expect = { x: 2, y: 2 }
    assert.deepEqual(result, expect)
  })
})

describe('distance', () => {
  it('should correctly calc distance between xy-points', () => {
    assert.equal(U.distance({ x: 0, y: 0 }, { x: 0, y: 0 }), 0)
    assert.equal(U.distance({ x: -2, y: -3 }, { x: -2, y: -3 }), 0)
    assert.equal(U.distance({ x: -1, y: 0 }, { x: 0, y: 0 }), 1)
    assert.equal(U.distance({ x: 0, y: 0 }, { x: 1, y: 1 }), Math.sqrt(2))
  })
})
