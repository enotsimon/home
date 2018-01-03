
import Util from "common/util";
import Color from "common/color";
import BasicDrawer from "experimental/basic_drawer";
import * as PIXI from "pixi.js";
import Planet from './planet';

export default class PlanetExp2 extends Planet {
  init_graphics() {
    super.init_graphics();
    this.map_transparency_alpha = 0;
  }

  sphere_map() {
    let map = [];
    let step = 2 * Math.PI / 36;
    let amplitude = Util.rand_float(0.1 * step, 0.5 * step);
    let count_waves = Util.rand(2, 10);
    for (let altitude = 1 * step; altitude < 2 * Math.PI / 2 - step; altitude += step) {
      count_waves = altitude / step | 0;
      map = map.concat(this.sin_ring(amplitude, altitude, count_waves));
    }
    return map;
  }

  sin_ring(amplitude, altitude, count_waves) {
    let map = [];
    let steps = 1000;
    for (let t = 0; t < 2 * Math.PI; t += 2 * Math.PI / steps) {
      let theta = altitude + amplitude * Math.sin(count_waves * t);
      let phi = t;
      map.push({phi, theta});
    }
    return map;
  }
}
