import yaml from 'js-yaml'

let config = `
---
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
        - goto: r_answer
      - if: some == 2
        sequence:
        - <b>: oh, i dont take it seriously
        - goto: r_answer
      - if: some == 3
        sequence:
        - <b>: by the way, my friend agree with me
        - <c>: yeah, i agree!
        - <b>: see?
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
      - if: roll == 0
        sequence:
        - <r>: omg again i'm a looser
        - <b>: yeah, you are! and let's try again
        - goto: r_answer
`

// Get document, or throw exception on error
try {
  //var doc = yaml.safeLoad(fs.readFileSync('/www/vhosts/my/home/app/monster/config/dialogs.yml', 'utf8'));
  let doc = yaml.safeLoad(config)
  console.log('parsed yaml doc', doc)
} catch (e) {
  console.log('error', e)
}
