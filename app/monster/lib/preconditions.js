//
// a collection of abstract preconditions for some actions -- like dialog phrases, cross-scenes walks etc
//
import game from 'monster/monster'
import * as actions from 'monster/actions'

export function check_preconditions(entity) {
  if (!entity.preconditions) {
    return true;
  }
  return entity.preconditions.every(precondition => check_precondition(precondition));
}

function check_precondition(precondition) {
  if (!precondition.type) {
    throw({msg: 'precondition has no type', precondition});
  }
  switch (precondition.type) {
    case 'flag':
      return check_precondition_of_flag_type(precondition);
    default:
      throw({msg: 'unknown precondition type', precondition});
  }
}

function check_precondition_of_flag_type(precondition) {
  if (!precondition.name || typeof precondition.name !== 'string') {
    throw({msg: "precondition of flag type should has 'name' property and it should be string", precondition});
  }
  if (!precondition.hasOwnProperty('value')) {
    throw({msg: "precondition of flag type should has 'value' property", precondition});
  }
  let state = game.store.getState();
  let flag_current_value = state.flags[precondition.name]
  /*
  // if flag is absent in global state we init it with initial false value
  // TODO -- i removed this code because it is called from reducers.main_menu and fall with
  // Uncaught Error: Reducers may not dispatch actions.
  // so we are to remove this code from reducers some way
  // or just to forget...
  if (state.flags[precondition.name] === undefined) {
    game.store.dispatch(actions.change_global_flag(precondition.name, false));
    state = game.store.getState();
  }
  */
  if (flag_current_value === undefined) {
    flag_current_value = false
  }
  return flag_current_value == precondition.value;
}
