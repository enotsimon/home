// @flow
/* eslint-env mocha */
import { describe, it } from 'mocha'
import { assert } from 'chai'

import * as G from 'common/geometry'

const samplesForisIn = [
  { x: 0, y: 0, sq: true, lo: true },
  { x: 1, y: 0, sq: true, lo: true },
  { x: 0, y: 1, sq: true, lo: true },
  { x: 1, y: 1, sq: true, lo: false },
  { x: 0.9, y: 0.9, sq: true, lo: true },
  { x: -1, y: 0, sq: true, lo: true },
  { x: 0, y: -1, sq: true, lo: true },
  { x: -1, y: -1, sq: true, lo: false },
  { x: -0.9, y: -0.9, sq: true, lo: true },
  { x: -1, y: 1, sq: true, lo: false },
  { x: -0.9, y: 0.9, sq: true, lo: true },
  { x: 1, y: -1, sq: true, lo: false },
  { x: 0.9, y: -0.9, sq: true, lo: true },
  { x: 2, y: 0, sq: false, lo: false },
  { x: 0, y: 2, sq: false, lo: false },
  { x: 2, y: 2, sq: false, lo: false },
  { x: -2, y: 0, sq: false, lo: false },
  { x: 0, y: -2, sq: false, lo: false },
  { x: -2, y: -2, sq: false, lo: false },
]
describe('isInSquare', () => {
  samplesForisIn.forEach(({ x, y, sq }) => {
    it(`x: ${x} y: ${y}`, () => assert.equal(G.isInSquare(2, { x, y }), sq))
  })
})

describe('isInLozenge', () => {
  samplesForisIn.forEach(({ x, y, lo }) => {
    it(`x: ${x} y: ${y}`, () => assert.equal(G.isInLozenge(2, { x, y }), lo))
  })
})
