//
// a collection of abstract conds for some actions -- like dialog phrases, cross-scenes walks etc
//
import game from 'monster/monster'
import * as actions from 'monster/actions'

export function check_conds_list(conds) {
  if (conds === undefined || conds === null) {
    return true
  }
  return conds.every(check_cond)
}

export function check_cond(cond) {
  if (cond === undefined || cond === null) {
    return true
  }
  if (!cond.type) {
    throw({msg: 'cond has no type', cond})
  }
  switch (cond.type) {
  case 'flag':
      return check_cond_of_flag_type(cond)
  default:
      throw({msg: 'unknown cond type', cond})
  }
}

function check_cond_of_flag_type(cond) {
  if (!cond.name || typeof cond.name !== 'string') {
    throw({msg: "cond of flag type should has 'name' property and it should be string", cond})
  }
  if (!cond.hasOwnProperty('value')) {
    throw({msg: "cond of flag type should has 'value' property", cond})
  }
  let state = game.store.getState()
  let what = cond.what || '=='
  let flag_current_value = state.flags[cond.name]
  if (flag_current_value === undefined) {
    flag_current_value = false
  }

  switch (what) {
    case '==': return flag_current_value == cond.value
    case '!=': return flag_current_value != cond.value
    case '>=': return flag_current_value >= cond.value
    case '<=': return flag_current_value <= cond.value
    case '<': return flag_current_value < cond.value
    case '>': return flag_current_value < cond.value
    default: throw({msg: "unknown 'what' type", cond})
  }
}
