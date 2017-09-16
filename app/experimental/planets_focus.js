
import Util from "common/util";
import Color from "common/color";
import BasicDrawer from "experimental/basic_drawer";
import * as PIXI from "pixi.js";

/**
 *
 */
export default class PlanetsFocus extends BasicDrawer {
  constructor() {
    super('circle');
  }

  init_graphics() {
    this.matrix = new PIXI.Container();
    this.base_container.addChild(this.matrix);
    this.bodies = [];
    this.init_bodies();
    this.forced_focus = false;
    this.focused_body = this.bodies[0];
    this.focus_change_threshold = 300;
    this.focus_change_tick = this.focus_change_threshold;
    this.update_matrix_by_focus();
  }

  redraw() {
    this.bodies.forEach(body => {
      body.orbital_angle += this.tick_delta * body.orbital_speed;
      body.angle += this.tick_delta * (body.orbital_speed + body.rotation_speed);
      this.set_graphics_transform_by_stellar_coords(body);
    });
    if (--this.focus_change_tick <= 0) {
      this.focus_change_tick = this.focus_change_threshold;
      if (!this.forced_focus) {
        let cur_index = this.bodies.indexOf(this.focused_body);
        this.focused_body = this.bodies[cur_index == this.bodies.length - 1 ? 0 : cur_index + 1];
        console.log('now focus on', this.focused_body.name);
      }
    }
    this.update_matrix_by_focus();
  }


  update_matrix_by_focus() {
    // TODO do it second time on each frame, bad
    let coords = this.calc_coords_recursively(this.focused_body);
    this.matrix.position.x = - coords.x;
    this.matrix.position.y = - coords.y;
  }

  calc_coords_recursively(body, acc = {x: 0, y: 0}) {
    let coords = Util.from_polar_coords(body.orbital_angle, body.orbital_radius);
    acc.x += coords.x;
    acc.y += coords.y;
    if (body.parent) {
      return this.calc_coords_recursively(body.parent, acc);
    }
    return acc;
  }


  init_bodies() {
    // name, parent, orbital_radius, radius, orbital_speed, rotation_speed, [orbital_angle], [angle]
    this.star = this.init_body('star', null, 0, 10, 0, .5);
    this.planet1 = this.init_body('planet1', this.star, 20, 3, 1, 0);
    this.moon1 = this.init_body('moon1', this.planet1, 6, 1, 2, 2);
    this.planet2 = this.init_body('planet2', this.star, 40, 5, 2, 3);
    this.moon21 = this.init_body('moon21', this.planet2, 8, 2, 3, .1);
    this.moon22 = this.init_body('moon22', this.planet2, 12, 1, 4, 1);
  }

  init_body(name, parent, orbital_radius, radius, orbital_speed, rotation_speed) {
    let body = new StellarBody(name, parent, orbital_radius, radius, orbital_speed, rotation_speed);
    this.init_body_graphics(body, parent);
    let parent_graphics = parent ? parent.base_container : this.matrix;
    parent_graphics.addChild(body.base_container);
    this.bodies.push(body);
    return body;
  }

  init_body_graphics(body, parent) {
    // thats because base_container do not rotate with planet rotation, otherwise
    // all moons rotate with planet's self rotations
    body.base_container = new PIXI.Graphics();
    body.graphics = new PIXI.Graphics();
    body.base_container.addChild(body.graphics);
    this.set_graphics_transform_by_stellar_coords(body);
    body.graphics.lineStyle(body.radius/10, Color.to_pixi([255, 255, 255]));
    body.graphics.drawCircle(0, 0, body.radius);
    body.graphics.closePath();
    ([1, 2, 3]).forEach(i => {
      let coords = Util.from_polar_coords(i * 2 * Math.PI / 3, body.radius/2);
      body.graphics.drawCircle(coords.x, coords.y, body.radius/4);
      body.graphics.closePath();
    });
  }

  set_graphics_transform_by_stellar_coords(body) {
    let coords = Util.from_polar_coords(body.orbital_angle, body.orbital_radius);
    // thats not a mistake, see comment below
    body.base_container.x = coords.x;
    body.base_container.y = coords.y;
    body.graphics.rotation = body.angle;
  }
}

class StellarBody {
  constructor(name, parent, orbital_radius, radius, orbital_speed, rotation_speed, orbital_angle = false, angle = false) {
    let radius_factor = 1.5; // DEBUG!!!
    this.name = name;
    this.parent = parent;
    this.orbital_radius = radius_factor * orbital_radius;
    this.radius = radius_factor * radius;
    this.orbital_speed = Util.radians(orbital_speed);
    this.rotation_speed = Util.radians(rotation_speed);
    this.orbital_angle = orbital_angle ? orbital_angle : 2 * Math.PI * Math.random();
    this.angle = angle ? angle : 2 * Math.PI * Math.random();
  }
}

let app = new PlanetsFocus();
