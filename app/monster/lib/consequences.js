//
// a collection of abstract consequences for some actions -- like dialog phrases, cross-scenes walks etc
// really same as preconditions
//
import game from 'monster/monster'
import * as actions from 'monster/actions'

export function apply_consequences(entity) {
  if (!entity.consequences) {
    return true;
  }
  entity.consequences.forEach(consequence => apply_consequence(consequence));
}

// TODO same as check_precondition()
function apply_consequence(consequence) {
  if (!consequence.type) {
    throw({msg: 'consequence has no type', consequence});
  }
  switch (consequence.type) {
    case 'flag':
      return apply_consequence_of_flag_type(consequence);
    default:
      throw({msg: 'unknown consequence type', consequence});
  }
}

// TODO same as check_precondition_of_flag_type()
function apply_consequence_of_flag_type(consequence) {
  if (!consequence.name || typeof consequence.name !== 'string') {
    throw({msg: "consequence of flag type should has 'name' property and it should be string", consequence});
  }
  if (!consequence.hasOwnProperty('value')) {
    throw({msg: "consequence of flag type should has 'value' property", consequence});
  }
  game.store.dispatch(actions.change_global_flag(consequence.name, consequence.value));
}
