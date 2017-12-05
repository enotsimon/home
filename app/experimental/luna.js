
import Util from "common/util";
import Color from "common/color";
import BasicDrawer from "experimental/basic_drawer";
import * as PIXI from "pixi.js";

/**
 *
 */
export default class Luna extends BasicDrawer {
  constructor() {
    let debug_additional = [{id: 'debug_info_theta', text: 'theta value'}];
    super('circle', debug_additional);
  }

  init_graphics() {
    this.luna = new PIXI.Container();
    this.base_container.addChild(this.luna);
    this.trajectory = new PIXI.Container();
    this.base_container.addChild(this.trajectory);

    this.tick = 0;
    this.phi = 0;
    this.theta = 0;
    this.theta_divider = 1;
    this.radius = 0.9 * 0.5 * this.size;

    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(Color.to_pixi([255, 255, 255]));
    this.graphics.drawRect(0, 0, .5, .5);
    this.graphics.endFill();
    this.luna.addChild(this.graphics);
    this.update_point_place();
  }

  redraw() {
    this.update_angles();
    this.update_point_place();
    this.clone_point();
    document.getElementById('debug_info_theta').innerHTML = 'divider: ' + this.theta_divider + ', theta: ' + this.theta;
  }

  update_angles() {
    this.tick++;
    this.basic_angle = (2 * Math.PI / 360);
    this.phi = this.tick * this.basic_angle;
    this.theta = 0.025 * this.tick * this.basic_angle;
    this.radius = 0.9 * 0.5 * this.size;
  }

  get_coords() {
    let x = this.radius * Math.cos(this.phi) * Math.sin(this.theta);
    let y = this.radius * Math.sin(this.phi);
    // rotation exp
    let precession = this.theta;
    let sp = Math.sin(precession);
    let cp = Math.cos(precession);
    let nx = x * cp - y * sp;
    let ny = x * sp + y * cp;
    return {x: nx, y: ny};
  }

  update_point_place() {
    let coords = this.get_coords();
    this.graphics.x = coords.x;
    this.graphics.y = coords.y;
  }

  clone_point() {
    let clone = this.graphics.clone();
    clone.x = this.graphics.x;
    clone.y = this.graphics.y;
    clone.alpha = 0.5;
    this.trajectory.addChild(clone);
    if (this.trajectory.children.length > 1000) {
      this.trajectory.addChild(clone);
      this.trajectory.removeChildAt(0);
    }
  }
}

let app = new Luna();
