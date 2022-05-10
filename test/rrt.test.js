// @flow
/* eslint-env mocha */
import { describe, it } from 'mocha'
import { assert } from 'chai'

import * as RRT from '../app/common/rrt_diagram'

describe('pointsByGenerations', () => {
  it('base case', () => {
    const rrt = [
      { x: 0, y: 0, generation: 0, index: 0, parent: null, children: [1, 2] },
      { x: 1, y: 1, generation: 1, index: 1, parent: 0, children: [3] },
      { x: 0, y: 1, generation: 1, index: 2, parent: 0, children: [4] },
      { x: 1, y: 2, generation: 2, index: 3, parent: 1, children: [] },
      { x: 1, y: 3, generation: 3, index: 4, parent: 2, children: [] },
    ]
    const expect = [
      [rrt[0].index],
      [rrt[1].index, rrt[2].index],
      [rrt[3].index],
      [rrt[4].index],
    ]
    const result = RRT.pointsByGenerationsIndex(rrt)
    assert.deepEqual(result, expect)
  })
})
