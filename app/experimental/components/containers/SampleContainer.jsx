// @flow
import { connect } from 'react-redux'

import { actionTick } from '../../actions'
import { Sample } from '../Sample'

const mergeProps = (state, { dispatch }, ownProps) => {
  return {
    ...ownProps,
    fps: state.fps,
    additional: [{ id: 'sika', text: 'test', value: 43 }],
    dispatchActionTick: (fps) => dispatch(actionTick(fps)),
  }
}

export const SampleContainer = connect(state => state, null, mergeProps)(Sample)
