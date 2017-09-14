
import Util from "common/util";
import Color from "common/color";
import BasicDrawer from "experimental/basic_drawer";
import * as PIXI from "pixi.js";

/**
 *  TODO:
 *    - add debug info of angle_inc, acceleration, speed
 *    - zooming with speed change? tried, looks bad
 *    - fix graphics redraw leaps!!!
 */
export default class MovingArrows extends BasicDrawer {
  constructor() {
    super('square');
  }

  init_graphics() {
    this.size_coef = 7;
    this.step = this.size / this.size_coef;
    this.matrix_size = 2 * this.size;
    this.arrows = [];
    this.change_angle_chance = .05;
    this.angle = 0;
    this.angle_inc = 0;
    this.angle_inc_max = 2 * Math.PI / 90;
    this.acceleration = 0;
    this.max_speed = 3;
    this.min_speed = 1.5;
    this.speed = (this.max_speed - this.min_speed)/2;
    this.color = [255, 255, 255];
    this.matrix_container = new PIXI.Container();
    this.matrix_container.x = -this.step;
    this.matrix_container.y = -this.step;
    this.base_container.addChild(this.matrix_container);

    for (let y = -2 * this.step; y < this.matrix_size; y += this.step) {
      for (let x = -2 * this.step; x < this.matrix_size; x += this.step) {
        // git very bad quality on big scales, so we have to set it small and big font size
        let size = this.step * 9;
        let arrow = new PIXI.Text('⇨', {fontFamily: 'Arial', fontSize: size, fill: Color.to_pixi(this.color)});
        arrow.scale = {x: 0.1, y: 0.1};
        arrow.x = x;
        arrow.y = y;
        arrow.rotation = this.angle;
        this.arrows.push(arrow);
      }
    }
    this.arrows.forEach(arrow => this.matrix_container.addChild(arrow));
  }


  redraw() {
    if (Math.random() <= this.change_angle_chance) {
      this.angle_inc = this.cos_interpolation(-this.angle_inc_max, this.angle_inc_max, Math.random());
    }
    this.angle += this.angle_inc;
    let acceleration = this.angle_inc_max / 2 - Math.abs(this.angle_inc);
    let new_speed = this.speed + acceleration;
    this.speed = Math.max(this.min_speed, Math.min(new_speed, this.max_speed));
    
    let radius = this.speed;
    let angle = this.angle;
    let diff = Util.from_polar_coords(angle, radius);
    this.arrows.forEach(arrow => {
      // TODO seems too complicated. is there better way?
      arrow.x = (arrow.x + diff.x) % this.matrix_size + (arrow.x < 0 ? this.matrix_size : 0);
      arrow.y = (arrow.y + diff.y) % this.matrix_size + (arrow.y < 0 ? this.matrix_size : 0);
      arrow.rotation = this.angle;
    });
  }

  // took it from http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
  // russian https://habrahabr.ru/post/142592/
  cos_interpolation(min, max, x) {
    let f = (1 - Math.cos(Math.PI * x)) * .5;
    return min*(1-f) + max*f;
  }
}

let app = new MovingArrows();
