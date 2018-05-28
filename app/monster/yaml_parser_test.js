import yaml from 'js-yaml'
import uuid from 'uuid'
console.log('uuidv1', uuid.v1())

let config = `
dialogs:
- id: barmen_root
  sequence:
  - <b>: hey
  - <r>: what?
  - <b>: you're bitch
  - id: r_answer
    choose:
    - <r>: what! fuck off!
      cond: show_once_per_dialog
      sequence:
      - <b>: okay! but try_again
      - goto: r_answer
    - <r>: i gonna kill you!
      cond: show_once_per_dialog
      sequence:
      - cond: some == 1
        sequence:
        - <b>: im not impressed...
        - goto: lets_continue_here
      - cond: some == 2
        sequence:
        - <b>: oh, i dont take it seriously
        - goto: lets_continue_here
      - cond: some == 3
        sequence:
        - <b>: by the way, my friend agree with me
        - <c>: yeah, i agree!
        - <b>: see?
        - goto: lets_continue_here
      - id: lets_continue_here
        sequence:
        - <r>: and i dont care and kill you anyway!
        - <b>: boooring...
        - goto: r_answer
    - <r>: quit this shit now...
      sequence:
      - <b>: bye then!
    # choose element is sequence, not a phrase
    # cond applied to sequence, not a phrase!
    # we can fugure it as a 'null' phrase with 'sequence' prop
    - cond: today_is == 'sunday'
      sequence:
      - cond: roll == 1
        sequence:
        - <r>: sunday secret answer
        - <b>: oh, now! i'm sucked
        - goto: r_answer
      - cond: roll == 0
        sequence:
        - <r>: omg again i'm a looser
        - <b>: yeah, you are! and let's try again
        - goto: r_answer
# thats just a test
scenes:
- id: mage_room
  mobiles: [mage]
  furniture: [mage_room_table, mage_room_shelf, mage_room_bed]
  links:
    - id_scene: mage_home_hall
    - id_scene: mage_home_vallo_room
  dialogs:
    - {talkers: [mage], node: mage_root}
`

const parse_yaml_config_dialogs = (config) => {
  let dialogs = []
  dialogs = parse_dialog_process_config_tree(config, parse_dialog_set_id)
  /*
  config.forEach(element => {
    let cell = parse_dialog_element(element)
    dialogs = [...dialogs, cell]
    if (element.sequence) {
      //let parse_dialog_sequence(element.sequence)
    }
    console.log('cell', cell)
  })*/
  return dialogs
}

const parse_dialog_process_config_tree = (config, func) => {
  if (config instanceof Array) {
    return config.map(e => parse_dialog_process_config_tree(e, func))
  } else {
    let element = func(config)
    if (element.sequence && element.choose) {
      throw({msg: "dialogs config element got both 'sequence' and 'choose' props", element})
    }
    if (element.sequence) {
      element.sequence = parse_dialog_process_config_tree(element.sequence, func)
    }
    if (element.choose) {
      element.choose = parse_dialog_process_config_tree(element.choose, func)
    }
    return element
  }
}

const parse_dialog_set_id = (element) => {
  return {...element, id: element.id || uuid.v1()}
}

const parse_dialog_element = (element, prev_element = null) => {
  let cell = {id: null, cond: null, car: null, cdr: null, before: [], after: []}
  // set_id
  cell.id = element.id ? element.id : uuidv1()
  // set_cond
  cell.cond = parse_dialog_cond(element)
  // parse_before
  cell.before = element.before
  // parse_after
  cell.after = element.after

  return cell
}

// TODO add parsing of data
const parse_dialog_cond = element => {
  if (element.cond && element.if) {
    throw({msg: "element got both 'cond' and 'if' props", element})
  }
  return element.cond || element.if
}

const parse_yaml_config = (config) => {
  return {
    dialogs: parse_yaml_config_dialogs(config.dialogs),
    scenes: config.scenes,
  }
}

let game_config = []
try {
  let doc = yaml.safeLoad(config)
  console.log('parsed yaml doc', doc)
  game_config = parse_yaml_config(doc)
} catch (e) {
  console.log('error', e)
}
console.log('parsed config', game_config)
