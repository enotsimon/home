// @flow
import { connect } from 'react-redux'

import { actionTick, actionMouseMove } from '../../actions'
import { Sample } from '../Sample'

const mergeProps = (state, { dispatch }, ownProps) => {
  return {
    ...ownProps,
    fps: state.fps,
    mousePos: state.mousePos,
    additional: [{ id: 'sika', text: 'test', value: 43 }],
    dispatchActionTick: (fps) => dispatch(actionTick(fps)),
    dispatchActionMouseMove: (event) => dispatch(actionMouseMove(event)),
  }
}

export const SampleContainer = connect(state => state, null, mergeProps)(Sample)
