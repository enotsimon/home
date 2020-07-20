// @flow
/* eslint-env mocha */
import { describe, it } from 'mocha'
import { assert } from 'chai'
import * as R from 'ramda'
import * as U from '../app/common/utils'

import { randomPointPolar } from '../app/experimental/random_points'

describe('randomPointPolar', () => {
  it('should generate points at least in specific range', () => {
    const maxRadius = 100
    const points = R.map(() => {
      return U.fromPolarCoords(randomPointPolar(maxRadius))
    })(R.range(1, 500))
    points.forEach(({ x, y }) => {
      assert.isAtMost(x, maxRadius, 'x > radius !!')
      assert.isAtLeast(x, -maxRadius, 'x < -radius !!')
      assert.isAtMost(y, maxRadius, 'y > radius !!')
      assert.isAtLeast(y, -maxRadius, 'y < -radius !!')
    })
  })
})
