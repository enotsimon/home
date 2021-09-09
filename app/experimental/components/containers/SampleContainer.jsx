// @flow
import { connect } from 'react-redux'

import { actionTick, actionMouseMove } from '../../actions'
import { Sample } from '../Sample'

const mergeProps = (state, { dispatch }, ownProps) => {
  return {
    ...ownProps,
    fps: state.fps,
    redrawTime: state.redrawTime,
    mousePos: state.mousePos,
    additional: state.debugInfo,
    dispatchActionTick: (fps, delta, redrawTime, debugInfo) => dispatch(actionTick(fps, delta, redrawTime, debugInfo)),
    dispatchActionMouseMove: (event) => dispatch(actionMouseMove(event)),
  }
}
// $FlowIgnore
export const SampleContainer = connect(state => state, null, mergeProps)(Sample)
