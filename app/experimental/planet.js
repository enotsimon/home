
import Util from "common/util";
import Color from "common/color";
import BasicDrawer from "experimental/basic_drawer";
import * as PIXI from "pixi.js";

export default class Planet extends BasicDrawer {
  constructor() {
    super('circle');
  }

  update_debug_info() {
    return [
      {id: 'debug_info_precession', text: 'precession', value: Util.degrees(this.precession) | 0},
      {id: 'debug_info_nutation', text: 'nutation', value: Util.degrees(this.nutation) | 0},
      {id: 'debug_info_rotation', text: 'rotation', value: Util.degrees(this.rotation) | 0},
      {id: 'debug_info_count_points', text: 'count points', value: this.points ? this.points.length: 0},
    ];
  }

  init_graphics() {
    this.planet = new PIXI.Container();
    this.base_container.addChild(this.planet);

    this.radius = 0.9 * 0.5 * this.size;
    this.rotation = null;
    this.precession = null;
    this.nutation = null;
    this.points = this.init_graphics_from_sphere_map(this.sphere_map());
    this.map_transparency_alpha = 0;
    this.draw_contour = true;

    if (this.draw_contour) {
      let contour = new PIXI.Graphics();
      contour.lineStyle(1, Color.to_pixi([255, 255, 255]));
      contour.drawCircle(0, 0, this.radius);
      this.base_container.addChild(contour);
    }
  }

  redraw() {
    this.change_angles(this.ticks);
    this.points.forEach(point => {
      let coords = this.calc_single_point(
        this.radius,
        point.phi,
        point.theta,
        this.rotation,
        this.precession,
        this.nutation
      );
      point.graphics.alpha = coords.z < 0 ? this.map_transparency_alpha : 1;
      point.graphics.x = coords.x;
      point.graphics.y = coords.y;
    });
  }

  calc_single_point(radius, phi, theta, rotation, precession, nutation) {
    let x = radius * Math.cos(phi) * Math.sin(theta),
        y = radius * Math.sin(phi) * Math.sin(theta),
        z = radius * Math.cos(theta),
        sin_r = Math.sin(rotation), cos_r = Math.cos(rotation),
        sin_p = Math.sin(precession), cos_p = Math.cos(precession),
        sin_n = Math.sin(nutation), cos_n = Math.cos(nutation),
        cos_n_sin_r = cos_n * sin_r, cos_n_cos_r = cos_n * cos_r,
        x2 = x * (cos_p * cos_r - sin_p * cos_n_sin_r) + y * (-cos_p * sin_r - sin_p * cos_n_cos_r) + z * (sin_p * sin_n),
        y2 = x * (sin_p * cos_r + cos_p * cos_n_sin_r) + y * (-sin_p * sin_r + cos_p * cos_n_cos_r) + z * (-cos_p * sin_n),
        z2 = x * (sin_n * sin_r) + y * (sin_n * cos_r) + z * cos_n;
    return {x: x2, y: y2, z: z2};
  }

  change_angles(ticks) {
    this.rotation = Util.radians(0) + ticks * (2 * Math.PI / 360);
    this.precession = Util.radians(22.5) + Util.radians(22.5) * Math.sin(ticks / 360);
    this.nutation = Util.radians(60) + 0 * ticks * (2 * Math.PI / 360);
  }

  sphere_map() {
    return [...Array(500).keys()].map(i => {
      return {
        phi: Util.rand_float(0, 2 * Math.PI),
        theta: Util.rand_float(0, 2 * Math.PI),
      };
    });
  }

  init_graphics_from_sphere_map(sphere_map) {
    return sphere_map.map(e => {
      e.graphics = new PIXI.Graphics();
      e.graphics.beginFill(Color.to_pixi([255, 255, 255]), 1);
      e.graphics.drawRect(0, 0, .5, .5);
      e.graphics.endFill();
      this.planet.addChild(e.graphics);
      return e;
    });
  }
}
