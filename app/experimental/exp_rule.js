
import Util from 'common/util'
import Tableau from 'experimental/tableau'

/**
 *
 */
export default class ExpRule extends Tableau {
  init_element_state(element) {
    element.color = Math.random() < 0.001 ? 1 : 0
  }

  mutate_state() {
    const step = 5
    // throttle to lower speed
    if (this.ticks % step == 1) {
      super.mutate_state()
    }
    /* if (this.ticks % (30 * step) == 1) {
      this.init_state();
    } */
  }

  // this func suppose to change new_color prop, not color!
  mutate_element_state(element) {
    const x = element.x; const
      y = element.y
    const e1 = this.get_element_color(x - 1, y - 1, this.out_of_border_func)


    const e2 = this.get_element_color(x + 0, y - 1, this.out_of_border_func)


    const e3 = this.get_element_color(x + 1, y - 1, this.out_of_border_func)


    const e4 = this.get_element_color(x - 1, y + 0, this.out_of_border_func)


    const e5 = this.get_element_color(x + 0, y + 0, this.out_of_border_func)


    const e6 = this.get_element_color(x + 1, y + 0, this.out_of_border_func)


    const e7 = this.get_element_color(x - 1, y + 1, this.out_of_border_func)


    const e8 = this.get_element_color(x + 0, y + 1, this.out_of_border_func)


    const e9 = this.get_element_color(x + 1, y + 1, this.out_of_border_func)
    element.new_color = this.rule(e1, e2, e3, e4, e5, e6, e7, e8, e9)
  }

  out_of_border_func() {
    // return Util.rand(0, 1); ???
    return 0
  }

  //
  rule(e1, e2, e3, e4, e5, e6, e7, e8, e9) {
    if (e5 == 1) {
      return 1
    }
    const pattern = `${e1}${e2}${e3}${e4}${e5}${e6}${e7}${e8}${e9}`
    switch (pattern) {
      case '010000000':
      case '000100000':
      case '000001000':
      case '000000010':
        return 1
      case '101000000':
      case '100000100':
      case '001000001':
      case '000000101':
        return 1
      case '111000000':
      case '100100100':
      case '001001001':
      case '000000111':
        return 1
      // case '010001000':
      // case '010100000':
      // case '000001010':
      // case '000100010':
        // return 1;
      // case '100000000':
      // case '000000001':
      // case '001000000':
      // case '000000100':
        // return 1;
      default:
        return 0
    }
  }
}
