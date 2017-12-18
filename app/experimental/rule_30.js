
import Util from "common/util";
import Tableau from "experimental/tableau";

/**
 * https://en.wikipedia.org/wiki/Rule_30
 */
export default class Rule30 extends Tableau {
  
  init_element_state(element) {
    //element.color = (element.y == this.y_size - 1) && (element.x == this.x_size / 2 | 0) ? 1 : 0;
    element.color = 0;
  }

  mutate_state() {
    // throttle to lower speed
    if (this.ticks % 3 == 1) {
      super.mutate_state();
    }
  }

  // this func suppose to change new_color prop, not color!
  mutate_element_state(element) {
    let color = 0;
    if (element.y == this.y_size - 1) {
      let l = this.get_element_color(element.x - 1, element.y, this.out_of_border_func);
      let r = this.get_element_color(element.x + 1, element.y, this.out_of_border_func);
      let s = element.color;
      color = this.element_state_rule(l, r, s);
    } else {
      // just copy lower cell color
      color = this.data[element.y + 1][element.x].color;
    }
    element.new_color = color;
  }

  /**
   *  this is the main BAD moment -- we got RANDOM color for cells out of border
   *  thats NOT CORRECT and so this all is not pure rule 30 evolution, but
   *  rule 30 with random initial state and random border conditions
   */
  out_of_border_func() {
    return Util.rand(0, 1);  
  }

  // thats rule 30 itself
  element_state_rule(l, r, s) {
    // its a marasmus, but
    switch ('' + l + r + s) {
      case '111':
      case '110':
      case '101':
        return 0;
      case '100':
      case '011':
      case '010':
      case '001':
        return 1;
      case '000':
        return 0;
      default:
        throw({msg: "unknown pattern", pattern: [l, r, s]});
    }
  }
}
