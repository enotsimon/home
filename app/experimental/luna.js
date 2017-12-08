
import Util from "common/util";
import Color from "common/color";
import BasicDrawer from "experimental/basic_drawer";
import * as PIXI from "pixi.js";

export default class Luna extends BasicDrawer {
  constructor() {
    let debug_additional = [
      {id: 'debug_info_precession', text: 'precession speed'},
      {id: 'debug_info_nutation', text: 'nutation speed'},
    ];
    super('circle', debug_additional);
  }

  init_graphics() {
    this.tick = 0;
    this.count_figures = 1;
    this.figures = [...Array(this.count_figures).keys()].map(i => {
      let graphics = new PIXI.Graphics();
      this.base_container.addChild(graphics);
      return {
        id: i,
        graphics: graphics,
        radius: 0.9 * 0.5 * this.size,
        precession_coef: .0025 * Util.rand_float(-3, 3),
        nutation_coef: .025 * Util.rand_float(1, 3),
      };
    });

    document.getElementById('debug_info_precession').innerHTML = this.precession_coef;
    document.getElementById('debug_info_nutation').innerHTML = this.nutation_coef;
  }

  redraw() {
    this.tick++;
    this.figures.forEach(figure => this.draw_full_circle(figure));
  }

  calc_sibgle_point(radius, angle, precession, nutation) {
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
    for (let angle = 0; angle <= 2 * Math.PI; angle += 2 * Math.PI / 360) {
      let coords = this.calc_sibgle_point(
        figure.radius,
        angle,
        figure.precession_coef * this.tick,
        figure.nutation_coef * this.tick
      );
      figure.graphics.beginFill(Color.to_pixi([255, 255, 255]));
      figure.graphics.drawRect(coords.x, coords.y, .5, .5);
      figure.graphics.endFill();
    }
  }
}

let app = new Luna();
