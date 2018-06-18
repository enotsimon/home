// @flow
import * as R from 'ramda'
import yaml from 'js-yaml'
import type {
  dialogs_config,
  dialog_cell,
  dialog_cell_car,
  dialog_cell_cdr,
  dialogs_raw_config_element,
} from './types/dialog_types'

type walk_tree_callback = (
  element: dialogs_raw_config_element,
  parent: ?dialogs_raw_config_element,
  next: ?dialogs_raw_config_element,
  acc: any
) => any

export const parse_raw = (yaml_doc: string): any => yaml.safeLoad(yaml_doc)
export const parse_dialogs = (yaml_doc: string): dialogs_config => parse_yaml_config_dialogs(parse_raw(yaml_doc))

const parse_yaml_config_dialogs = (dialogs: Array<dialogs_raw_config_element>): dialogs_config => {
  // map is because in dialogs config organized as array, and next element in this array
  // is NOT logical next element for it
  // FIXME seq is crashing
  let keys = ['sequence', 'seq', 'choose']
  dialogs.forEach(e => walk_tree(e, null, null, keys, e2 => expand_macro(e2, keys)))
  dialogs.forEach(e => walk_tree(e, null, null, keys, set_id, [e.id, 1]))
  dialogs.forEach(e => walk_tree(e, null, null, keys, set_parent_and_next))
  let conf = R.mergeAll(R.map(e => walk_tree(e, null, null, keys, flatten_tree, {}), dialogs))
  conf = R.map(e => replace_arrays_of_elements_with_arrays_of_ids(e, keys), conf)
  conf = R.map(process_element, conf)
  
  console.log('conf', conf)
  return conf
}

/**
 * this func walks tree recursively applying func to every element and checking props
 * from keys as 'points of tree branching' func should be like
 * (element, parent_element, next_element, acc) -> acc
 * @FIXME flow dont understand element[key] he thinks that element is Array, not Object
 * maybe split this func into two
 */
const walk_tree = (
  element: dialogs_raw_config_element,
  parent: ?dialogs_raw_config_element,
  next: ?dialogs_raw_config_element,
  keys: Array<string>,
  func: walk_tree_callback,
  acc: any = []
): any => {
  if (element instanceof Array) {
    let pairs = R.aperture(2, [...element, null])
    return pairs.reduce((acc, [e1, e2]) => walk_tree(e1, parent, e2, keys, func, acc), acc, pairs)
  } else {
    acc = func(element, parent, next, acc)
    let filtered_keys = keys.filter(key => element[key])
    if (filtered_keys.length > 1) {
      throw({msg: 'element has more than one branching key', keys, element})
    }
    if (filtered_keys.length === 1) {
      acc = walk_tree(element[filtered_keys[0]], element, null, keys, func, acc)
    }
    return acc
  }
}

type set_id_acc = [string, number]

// TODO add id prefix
const set_id = (element, _parent, _next, [prefix: string, i: number]: set_id_acc): set_id_acc => {
  element.id = element.id || prefix + '.' + ++i
  return [prefix, i]
}

const set_parent_and_next = (element, parent, next): void => {
  element.parent = parent
  element.next = next
}

const flatten_tree = (element, _parent, _next, acc): dialogs_config => {
  return {...acc, [element.id]: element}
}

const replace_arrays_of_elements_with_arrays_of_ids = (element, keys) => {
  let clone = {...element}
  keys.forEach(key => {
    if (clone[key]) {
      clone[key] = clone[key].map(e => e.id)
    }
  })
  return clone
}

// warn we change input element, not returning new one
const expand_macro = (element, keys) => {
  seq_to_sequence(element)
  expand_cond(element)
}

const expand_cond = (element) => {
  if (element.cond && element.if) {
    throw({msg: "element got both 'cond' and 'if' props", element})
  }
  if (element.if) {
    element.cond = element.if
    element.if = undefined
  }
  if (typeof(element.cond) === 'string') {
    let parts = element.cond.split(/\s+/)
    if (parts.length) {
      element.cond = {type: "flag", name: parts[0], what: parts[1], value: parts[2]}
    } else {
      // throw
    }
  } // else check and write default what: '=='
}

const seq_to_sequence = element => {
  if (element.seq && element.sequence) {
    throw({msg: "element got both 'seq' and 'sequence' props", element})
  }
  if (element.seq) {
    element.sequence = element.seq
    element.seq = undefined
  }
}

const process_element = element => {
  let ret = {
    id: element.id,
    cond: parse_cond(element),
    car: get_cell_car(element),
    cdr: get_cell_cdr(element),
    before: element.before, // TODO parse
    after: element.after, // TODO parse
  }
  //console.log('ret', ret)
  return ret
}

// TODO add parsing of data
const parse_cond = element => {
  if (element.cond && element.if) {
    throw({msg: "element got both 'cond' and 'if' props", element})
  }
  return element.cond || element.if
}

const get_cell_car = (element): dialog_cell_car => {
  let phrase = get_phrase_from_element(element)
  // TEMP
  if (phrase && (element.sequence || element.choose)) {
    throw({msg: "sorry, element cannot has phrase AND sequence or choose props in one time", element})
  }
  if (phrase) {
    return {...phrase, type: 'phrase'}
  } else if (element.sequence) {
    // {type: 'link', id: element.sequence[0].id} ???
    return element.sequence[0]
  } else if (element.choose) {
    return {type: 'choose', ids: element.choose}
  } else {
    return null
  }
}

const get_cell_cdr = (element): dialog_cell_cdr => {
  // parent_element.car.type !!! ??? this may change
  if (element.parent && element.parent.car && element.parent.car.type === 'choose') {
    return null
  } else if (element.goto) {
    // should it be here or in expand_macro()?
    return element.goto
  } else if (element.next === null) {
    return null
  } else if (element.sequence) {
    return null
  } else if (element.choose) {
    return null
  } else {
    if (!element.next.id) {
      throw({msg: 'cannot set cell cdr cause element.next has no id', element})
    }
    return element.next.id
  }
}

const get_phrase_from_element = element => {
  let phrases = []
  for (let key in element) {
    let matches = /<(.*)>/.exec(key)
    if (matches) {
      phrases = [...phrases, {mobile: matches[1], phrase: element[key]}]
    }
  }
  if (phrases.length && phrases.length !== 1) {
    throw({msg: 'element has more than one phrase', element, phrases})
  }
  return phrases.length ? phrases[0] : null
}
