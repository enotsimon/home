// @flow
/* eslint-env mocha */

import { describe, it } from 'mocha'
import { assert } from 'chai'

describe('fake test', () => {
  it('does nothing', () => {
    assert.deepEqual({}, {})
  })
})
