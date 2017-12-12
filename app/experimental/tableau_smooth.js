
import Util from "common/util";
import Color from "common/color";
import Tableau from "experimental/tableau";
import * as PIXI from "pixi.js";

/**
 *
 */
export default class TableauSmooth extends Tableau {
  init_element_state(element) {
    element.color = Math.random();
    element.sign = 1;
  }

  mutate_element_state(element) {
    if (element.color <= 0) {
      element.sign = 1;
    } else if (element.color >= 1) {
      element.sign = -1;
    }
    element.new_color = (element.color + element.sign * (this.color_change_per_tick / 256));
    // they can be slightly less or greater this because of float calc errors or maybe some my error
    element.new_color = Math.max(0, element.new_color);
    element.new_color = Math.min(1, element.new_color);
  }
}
