
import Util from "common/util";
import Color from "common/color";
import BasicDrawer from "experimental/basic_drawer";
import * as PIXI from "pixi.js";

export default class Orbits extends BasicDrawer {
  constructor() {
    super('circle');
  }

  update_debug_info() {
    return [
      {id: 'debug_info_precession', text: 'precession', value: this.figures ? this.figures[0].precession_coef : ''},
      {id: 'debug_info_nutation', text: 'nutation', value: this.figures ? this.figures[0].nutation_coef : ''},
      {id: 'debug_info_additional', text: 'angle this.acceleration', value: this.acceleration},
    ];
  }

  init_graphics() {
    this.count_figures = 1;
    this.figures = [...Array(this.count_figures).keys()].map(i => {
      let graphics = new PIXI.Graphics();
      this.base_container.addChild(graphics);
      return {
        id: i,
        graphics: graphics,
        radius: 0.9 * 0.5 * this.size,
        //rotation_coef: .0025,
        precession_coef: .0025 * Util.rand_float(-3, 3),
        nutation_coef: .0025 * Util.rand_float(1, 3),
      };
    });
  }

  redraw() {
    this.figures.forEach(figure => this.draw_full_circle(figure));
  }

  calc_single_point(radius, angle, precession, nutation) {
    let x = radius * Math.cos(angle) * Math.sin(nutation);
    let y = radius * Math.sin(angle);
    let sp = Math.sin(precession);
    let cp = Math.cos(precession);
    let nx = x * cp - y * sp;
    let ny = x * sp + y * cp;
    return {x: nx, y: ny};
  }

  draw_full_circle(figure) {
    figure.graphics.clear();
    let count_dots = 2 * 36;
    this.acceleration = 5 * Math.cos(.005 * this.tick_time);
    for (let angle = 0; angle <= 2 * Math.PI; angle += 2 * Math.PI / count_dots) {
      let coords = this.calc_single_point(
        figure.radius,
        //angle + (figure.rotation_coef * this.tick_time) + this.acceleration,
        // i dont understand why its really this.acceleration and where is the speed?
        angle + this.acceleration,
        figure.precession_coef * this.tick_time,
        figure.nutation_coef * this.tick_time + 0.5 * this.acceleration
      );
      figure.graphics.beginFill(Color.to_pixi([255, 255, 255]));
      //figure.graphics.drawRect(coords.x, coords.y, .5, .5);
      figure.graphics.drawCircle(coords.x, coords.y, 1);
      figure.graphics.endFill();
    }
  }
}
