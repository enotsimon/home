// @flow
/* eslint-env mocha */
// этот тест нифига не запускается потому что ему нужен jsdom jsdom-global а им нужна node >= 12
import { describe, it } from 'mocha'
import { assert } from 'chai'

import { gatherPointGroups } from 'experimental/samples/spring_force'

const points = {
  // group 1
  p1: { id: 'p1', speed: { x: 0, y: 0 }, x: 0, y: 0, group: 0, contract: false, links: ['p2'] },
  p2: { id: 'p2', speed: { x: 0, y: 0 }, x: 0, y: 0, group: 0, contract: false, links: ['p3', 'p4', 'p1'] },
  p3: { id: 'p3', speed: { x: 0, y: 0 }, x: 0, y: 0, group: 0, contract: false, links: ['p2'] },
  p4: { id: 'p4', speed: { x: 0, y: 0 }, x: 0, y: 0, group: 0, contract: false, links: ['p5', 'p2'] },
  p5: { id: 'p5', speed: { x: 0, y: 0 }, x: 0, y: 0, group: 0, contract: false, links: ['p4'] },
  // group 2
  p6: { id: 'p6', speed: { x: 0, y: 0 }, x: 0, y: 0, group: 0, contract: false, links: ['p7', 'p8'] },
  p7: { id: 'p7', speed: { x: 0, y: 0 }, x: 0, y: 0, group: 0, contract: false, links: ['p6', 'p8'] },
  p8: { id: 'p8', speed: { x: 0, y: 0 }, x: 0, y: 0, group: 0, contract: false, links: ['p7', 'p6'] },
}

describe('gatherPointGroups', () => {
  it('should gather point groups', () => {
    assert.deepEqual(gatherPointGroups(1, points), {
      p1: { ...points.p1, group: 1 },
      p2: { ...points.p2, group: 1 },
      p3: { ...points.p3, group: 1 },
      p4: { ...points.p4, group: 1 },
      p5: { ...points.p5, group: 1 },
      p6: { ...points.p6, group: 2 },
      p7: { ...points.p7, group: 2 },
      p8: { ...points.p8, group: 2 },
    })
  })
})
