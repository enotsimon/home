
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
export default class PlanetsFocus extends BasicDrawer {
  constructor() {
    super('circle');
  }

  init_graphics() {
    this.matrix = new PIXI.Container();
    this.init_bodies();
  }


  redraw() {
    
  }


  init_bodies() {
    this.bodies = [];

    this.star = this.init_body('star', null, 0, 10, 0, .01);
    this.planet1 = this.init_body('planet1', this.star, 20, 3, .01, .02);
    this.moon1 = this.init_body('moon1', this.planet1, 6, 1, .02, .02);
    this.planet2 = this.init_body('planet2', this.star, 40, 5, .03, .02);
    this.moon21 = this.init_body('moon21', this.planet2, 8, 1, .03, .001);
    this.moon22 = this.init_body('moon22', this.planet2, 10, 2, .05, .01);
  }

  init_body(name, parent, orbital_radius, radius, orbital_speed, rotation_speed) {
    let body = new StellarBody(name, parent, orbital_radius, radius, orbital_speed, rotation_speed);
    body.graphics = new PIXI.Graphics();
    this.matrix.addChild(body.graphics);
    this.bodies.push(body);
  }

  init_body_graphics(body, graphics) {
    graphics.lineStyle(body.radius/10, Color.to_pixi([255, 255, 255]));
  }
}

class StellarBody {
  constructor(name, parent, orbital_radius, radius, orbital_speed, rotation_speed, orbital_angle = false, angle = false) {
    this.name = name;
    this.parent = parent;
    this.orbital_radius = orbital_radius;
    this.radius = radius;
    this.orbital_speed = orbital_speed;
    this.rotation_speed = rotation_speed;
    this.orbital_angle = orbital_angle ? orbital_angle : 2 * Math.PI * Math.random();
    this.angle = angle ? angle : 2 * Math.PI * Math.random();
  }
}

let app = new PlanetsFocus();
