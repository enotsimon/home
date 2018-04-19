import yaml from 'js-yaml'

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
      - if: some == 1
        sequence:
        - <b>: im not impressed...
        - goto: lets_continue_here
      - if: some == 2
        sequence:
        - <b>: oh, i dont take it seriously
        - goto: lets_continue_here
      - if: some == 3
        sequence:
        - <b>: by the way, my friend agree with me
        - <c>: yeah, i agree!
        - <b>: see?
        - goto: lets_continue_here
      - id: lets_continue_here
        <r>: and i dont care and kill you anyway!
        <b>: boooring...
        - goto: r_answer
    - <r>: quit this shit now...
      sequence:
      - <b>: bye then!
    # choose element is sequence, not a phrase
    # cond applied to sequence, not a phrase!
    # we can fugure it as a 'null' phrase with 'sequence' prop
    - if: today_is == 'sunday'
      sequence:
      - if: roll == 1
        sequence:
        - <r>: sunday secret answer
        - <b>: oh, now! i'm sucked
        - goto: r_answer
      - if: roll == 0
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
  let dialogs = {}
  config.forEach(element => {
    console.log("E", element)
  })
  return dialogs
}

// TODO
const parse_yaml_config_scenes = (config) => {
  return {}
}

const parse_yaml_config = (config) => {
  return {
    dialogs: parse_yaml_config_dialogs(config.dialogs),
    scenes: parse_yaml_config_scenes(config.scenes),
  }
}

let game_config = []
try {
  //var doc = yaml.safeLoad(fs.readFileSync('/www/vhosts/my/home/app/monster/config/dialogs.yml', 'utf8'));
  let doc = yaml.safeLoad(config)
  console.log('parsed yaml doc', doc)
  game_config = parse_yaml_config(doc)
} catch (e) {
  console.log('error', e)
}
console.log('parsed config', game_config)
