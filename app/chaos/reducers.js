import { combineReducers } from 'redux';
import * as actions from './actions';

let defaults = {
  phase: null,
};

function phase(state = defaults.phase, action) {
  switch (action.type) {
    case actions.ADVANCE_SYMBOLS_COMPLETE:
      return 'exchange';
    default:
      return state;
  }
}

const root_reducer = combineReducers({
  phase,
});

export default root_reducer;
