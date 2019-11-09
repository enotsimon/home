// @flow
import { connect } from 'react-redux'

import { actionTick } from '../../actions'
import { Sample } from '../Sample'

const mergeProps = (state, { dispatch }, ownProps) => {
  const dispatchActionTick = () => dispatch(actionTick())
  return {
    ...ownProps,
    additional: [{ id: 'sika', text: 'test', value: 43 }],
    dispatchActionTick,
  }
}

export const SampleContainer = connect(state => state, null, mergeProps)(Sample)
