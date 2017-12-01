
import Util from "common/util";
import Color from "common/color";
import BasicDrawer from "experimental/basic_drawer";
import * as PIXI from "pixi.js";

/**
 *
 */
export default class Tableau extends BasicDrawer {
  constructor() {
    let debug_additional = [];
    super('square', debug_additional);
  }

  init_graphics() {
    this.x_size = 100;
    this.y_size = 100;
    this.data = [];
    let radius = Math.min(this.size / (2 * this.x_size), this.size / (2 * this.y_size));
    for (let y = 0; y < this.y_size; y++) {
      this.data[y] = [];
      for (let x = 0; x < this.x_size; x++) {
        let graphics = new PIXI.Graphics();
        graphics.beginFill(Color.to_pixi([255, 255, 255]));
        graphics.drawCircle(
          Util.normalize_value(x + radius, this.x_size, this.size),
          Util.normalize_value(y + radius, this.y_size, this.size),
          radius
        );
        graphics.endFill();
        this.base_container.addChild(graphics);
        this.data[y][x] = {
          x: x,
          y: y,
          color: 0,
          new_color: 0,
          graphics: graphics,
        };
      }
    }
    this.init_state();
    this.update_circles();
  }

  redraw() {
    this.mutate_state();    
    this.update_circles();
  }

  update_circles() {
    this.for_all_elements(element => element.graphics.alpha = element.color);
  }

  for_all_elements(func) {
    this.data.forEach(line => {
      line.forEach(element => {
        func(element);
      });
    });
  }

  init_state() {
    this.for_all_elements(element => element.color = Math.random());
  }

  mutate_state() {
    this.for_all_elements(element => element.new_color = this.mutate_element_state(element));
    this.for_all_elements(element => element.color = element.new_color);
  }

  mutate_element_state(element) {
    return (element.color + (16 / 256)) % 1;
  }
}

let app = new Tableau();
