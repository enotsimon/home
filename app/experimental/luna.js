
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
    this.luna = new PIXI.Container();
    this.base_container.addChild(this.luna);
    this.trajectory = new PIXI.Container();
    this.base_container.addChild(this.trajectory);

    this.precession_coef = .0025 * Util.rand_float(-3, 3);
    this.nutation_coef = .025 * Util.rand_float(1, 3);
    this.tick = 0;
    this.radius = 0.9 * 0.5 * this.size;

    this.graphics = new PIXI.Graphics();
    this.luna.addChild(this.graphics);

    document.getElementById('debug_info_precession').innerHTML = this.precession_coef;
    document.getElementById('debug_info_nutation').innerHTML = this.nutation_coef;

  }

  redraw() {
    this.update_angles();
    this.draw_full_circle(this.graphics);
  }

  update_angles() {
    this.tick++;
  }

  get_coords(radius, angle, precession, nutation) {
    let x = radius * Math.cos(angle) * Math.sin(nutation);
    let y = radius * Math.sin(angle);
    let sp = Math.sin(precession);
    let cp = Math.cos(precession);
    let nx = x * cp - y * sp;
    let ny = x * sp + y * cp;
    return {x: nx, y: ny};
  }

  draw_full_circle(graphics) {
    graphics.clear();
    for (let angle = 0; angle <= 2 * Math.PI; angle += 2 * Math.PI / 360) {
      let coords = this.get_coords(this.radius, angle, this.precession_coef * this.tick, this.nutation_coef * this.tick);
      this.graphics.beginFill(Color.to_pixi([255, 255, 255]));
      this.graphics.drawRect(coords.x, coords.y, .5, .5);
      this.graphics.endFill();
    }
  }
}

let app = new Luna();
