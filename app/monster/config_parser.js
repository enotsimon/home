
import * as R from 'ramda'
import yaml from 'js-yaml'

export const parse_raw = (yaml_doc) => yaml.safeLoad(yaml_doc)
export const parse_dialogs = (yaml_doc) => parse_yaml_config_dialogs(parse_raw(yaml_doc))

const parse_yaml_config_dialogs = dialogs => {
  // map is because in dialogs config organized as array, and next element in this array
  // is NOT logical next element for it
  // FIXME seq is crashing
  let keys = ['sequence', 'seq', 'choose']
  dialogs.forEach(e => walk_tree(e, null, null, keys, e2 => expand_macro(e2, keys)))
  dialogs.forEach(e => walk_tree(e, null, null, keys, set_id, [e.id, 1]))
  dialogs.forEach(e => walk_tree(e, null, null, keys, set_parent_and_next))
  let conf = R.mergeAll(R.map(e => walk_tree(e, null, null, keys, flatten_tree, {}), dialogs))
  conf = R.map(e => replace_arrays_of_elements_with_arrays_of_ids(e, keys), conf)
  conf = R.map(seq_to_sequence, conf)
  conf = R.map(process_element, conf)
  
  console.log('conf', conf)
  return conf
}

/**
 * this func walks tree recursively applying func to every element and checking props
 * from keys as 'points of tree branching' func should be like
 * (element, parent_element, next_element, acc) -> acc
 */
const walk_tree = (element, parent, next, keys, func, acc = []) => {
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

// TODO add id prefix
const set_id = (element, _parent, _next, [prefix, i]) => {
  element.id = element.id || prefix + '.' + ++i
  return [prefix, i]
}

const set_parent_and_next = (element, parent, next) => {
  element.parent = parent
  element.next = next
}

const flatten_tree = (element, _parent, _next, acc) => {
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
  expand_macro_split_cells_with_phrase_and_sequence_or_choose(element, keys)
}

// TODO should remove it? exception below is enough
const expand_macro_split_cells_with_phrase_and_sequence_or_choose = (element, keys) => {
  return null
  let phrase = get_phrase_from_element(element)
  if (!phrase) {
    return null
  }
  keys.forEach(key => {
    if (element[key]) {
      //let {[key]: value, ...clone} = element
      //console.log('OH YES', clone, element)
    }
  })
}

const seq_to_sequence = element => {
  if (element.seq) {
    let {seq, ...clone} = element
    return {...clone, sequence: element.seq}
  }
  return element
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

const get_cell_car = element => {
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
    // crap!
    return {type: 'choose', ids: element.choose.map(e => e.id)}
  } else {
    return null
  }
}

const get_cell_cdr = (element) => {
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
      throw({msg: 'cannot set cell cdr cause next_element has no id', element, next_element})
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
