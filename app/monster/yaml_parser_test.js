
import uuid from 'uuid'
import * as R from 'ramda'
import yaml from 'js-yaml'

// async config parsing
let rrr = fetch('/monster/config/config.yml')
  .then(response => {
    if (response.ok) {
      return response.text()
    }
    throw {msg: 'cant get config', response}
  })
  .then(text => {
    parser_test(text)
  })
  .catch(alert)


const parse_yaml_config_dialogs = (config) => {
  let dialogs = []
  dialogs = parse_dialog_process_config_tree(parse_dialog_set_id, config)
  dialogs = parse_dialog_process_config_tree(parse_dialog_process_element, dialogs)
  return dialogs
}

// TODO not sure if its good idea to pass parent_element, next_element
// cause it makes this func very specific
const parse_dialog_process_config_tree = (func, config, next_element = null, parent_element = null) => {
  if (config instanceof Array) {
    //return config.map(e => parse_dialog_process_config_tree(func, e, next_element, ))
    let pairs = R.aperture(2, [...config, null])
    return pairs.map(([e, next]) => parse_dialog_process_config_tree(func, e, next, parent_element))
  } else {
    let element = func(config, next_element, parent_element)
    if (element.sequence && element.choose) {
      throw({msg: "dialogs config element got both 'sequence' and 'choose' props", element})
    }
    if (element.sequence) {
      element.sequence = parse_dialog_process_config_tree(func, element.sequence, null, element)
    }
    if (element.choose) {
      element.choose = parse_dialog_process_config_tree(func, element.choose, null, element)
    }
    return element
  }
}

// TODO add id prefix
const parse_dialog_set_id = (element) => {
  return {...element, id: element.id || uuid.v1()}
}

const parse_dialog_process_element = (element, next_element, parent_element) => {
  let cell = {...element} // !!!
  //console.log('cell', [cell, next_element, parent_element])
  //let cell = {id: element.id, cond: null, car: null, cdr: null, before: [], after: []}
  
  cell.cond = parse_dialog_cond(element)
  //cell.before = element.before
  //cell.after = element.after
  cell.car = get_cell_car(element)
  cell.cdr = get_cell_cdr(element, next_element, parent_element)
  return cell
}

// TODO add parsing of data
const parse_dialog_cond = element => {
  if (element.cond && element.if) {
    throw({msg: "element got both 'cond' and 'if' props", element})
  }
  return element.cond || element.if
}

const get_cell_car = element => {
  let phrases = get_phrase_from_element(element)
  if (phrases) {
    return {...phrases, type: 'phrase'}
  } else if (element.sequence) {
    // {type: 'link', id: element.sequence[0].id} ???
    return element.sequence[0].id
  } else if (element.choose) {
    // crap!
    return {type: 'choose', ids: element.choose.map(e => e.id)}
  } else {
    return null
  }
}

const get_cell_cdr = (element, next_element, parent_element) => {
  // parent_element.car.type !!! ??? this may change
  if (parent_element && parent_element.car && parent_element.car.type === 'choose') {
    return null
  } else if (element.goto) {
    return element.goto
  } else if (next_element === null) {
    return null
  } else {
    if (!next_element.id) {
      throw({msg: 'cannot set cell cdr cause next_element has no id', element, next_element})
    }
    return next_element.id
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

const parse_yaml_config = (config) => {
  return {
    dialogs: parse_yaml_config_dialogs(config.dialogs),
    scenes: config.scenes,
  }
}

const parser_test = (config) => {
  let game_config = []
  try {
    let doc = yaml.safeLoad(config)
    console.log('parsed yaml doc', doc)
    game_config = parse_yaml_config(doc)
  } catch (e) {
    console.log('error', e)
  }
  console.log('parsed config', game_config)
}
