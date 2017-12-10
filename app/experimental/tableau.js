
import Util from "common/util";
import Color from "common/color";
import BasicDrawer from "experimental/basic_drawer";
import * as PIXI from "pixi.js";

/**
 *
 */
export default class Tableau extends BasicDrawer {
  constructor() {
    super('square');
  }

  init_graphics() {
    this.tick = 0;
    this.color_change_per_tick = 8;
    this.x_size = 100;
    this.y_size = 100;
    this.data = [];
    let square_size = Math.min(this.size / this.x_size, this.size / this.y_size);
    for (let y = 0; y < this.y_size; y++) {
      this.data[y] = [];
      for (let x = 0; x < this.x_size; x++) {
        let graphics = new PIXI.Graphics();
        graphics.beginFill(Color.to_pixi([255, 255, 255]));
        graphics.drawRect(
          Util.normalize_value(x, this.x_size, this.size),
          Util.normalize_value(y, this.y_size, this.size),
          square_size,
          square_size
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
    this.tick++;
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
    this.for_all_elements(element => this.init_element_state(element));
  }

  init_element_state(element) {
    element.color = Math.random();
  }

  mutate_state() {
    this.for_all_elements(element => this.mutate_element_state(element));
    this.for_all_elements(element => element.color = element.new_color);
  }

  // this func suppose to change new_color prop, not color!
  mutate_element_state(element) {
    element.new_color = (element.color + (this.color_change_per_tick / 256)) % 1;
  }
}

let app = new Tableau();
