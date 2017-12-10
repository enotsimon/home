
import Util from "common/util";
import Color from "common/color";
import BasicDrawer from "experimental/basic_drawer";
import * as PIXI from "pixi.js";

export default class Planet extends BasicDrawer {
  constructor() {
    let debug_additional = [
      {id: 'debug_info_precession', text: 'precession'},
      {id: 'debug_info_nutation', text: 'nutation'},
      {id: 'debug_info_rotation', text: 'rotation'},
    ];
    super('circle', debug_additional);
  }

  init_graphics() {
    this.planet = new PIXI.Graphics();
    this.base_container.addChild(this.planet);

    this.radius = 0.9 * 0.5 * this.size;
    this.rotation = Util.radians(30);
    this.precession = Util.radians(30);
    this.nutation = Util.radians(30);
    this.points = this.sphere_map();
    this.map_regime = 'static';
    this.map_transparency_alpha = 0.25;

    document.getElementById('debug_info_precession').innerHTML = this.precession;
    document.getElementById('debug_info_nutation').innerHTML = this.nutation;
  }

  redraw() {
    if (this.map_regime == 'dynamic') {
      this.points = this.sphere_map();
    }
    this.change_angles();
    this.planet.clear();
    this.points.forEach(point => {
      let coords = this.calc_single_point(
        this.radius,
        point.phi,
        point.theta,
        this.rotation,
        this.precession,
        this.nutation
      );
      let alpha = 1;
      if (coords.z < 0) {
        alpha = this.map_transparency_alpha;
      }
      this.planet.beginFill(Color.to_pixi([255, 255, 255]), alpha);
      this.planet.drawRect(coords.x, coords.y, .5, .5);
      this.planet.endFill();
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

  change_angles() {
    this.rotation += 2 * Math.PI / 360;
    //this.precession += 2 * Math.PI / 360;
    //this.nutation += 0.5 * 2 * Math.PI / 360;
    document.getElementById('debug_info_rotation').innerHTML = this.rotation;
    document.getElementById('debug_info_precession').innerHTML = this.precession;
    document.getElementById('debug_info_nutation').innerHTML = this.nutation;
  }

  sphere_map() {
    return [...Array(500).keys()].map(i => {
      return {
        phi: Util.rand_float(0, 2 * Math.PI),
        theta: Util.rand_float(0, 2 * Math.PI),
      };
    });
  }
}

let app = new Planet();
