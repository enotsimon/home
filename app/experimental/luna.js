
import Util from "common/util";
import Color from "common/color";
import BasicDrawer from "experimental/basic_drawer";
import * as PIXI from "pixi.js";
import Planet from './planet';

export default class Luna extends Planet {
  sphere_map() {
    let map = [];
    let count_craters = 50;
    let i = 0;
    let craters_data = [];
    while (count_craters) {
      if (++i > 1000) {
        throw("too many cycles");
      }
      // rotation has no meaning in this case
      let precession = Util.rand_float(0, 2 * Math.PI);
      let nutation = Util.rand_float(0, 2 * Math.PI);
      let crater_diameter = Util.rand_float(Util.radians(1), Util.radians(15));
      let planet_radius = this.radius;
      let crossing = craters_data.some(c => {
        let distance = crater_diameter + c.crater_diameter + Util.radians(2);
        return this.sphere_angles_distance({precession, nutation}, c) < distance;
      });
      if (crossing) {
        continue;
      }
      craters_data.push({precession, nutation, crater_diameter});

      let crater = this.crater(planet_radius, crater_diameter, precession, nutation);
      map = map.concat(crater);
      count_craters--;
    }
    return map;
  }

  crater(planet_radius, crater_diameter, precession, nutation) {
    let data = [];
    for (let a = 0; a <= 2 * Math.PI; a += 2 * Math.PI / 360) {
      let coords = this.calc_single_point(planet_radius, a, crater_diameter, 0, precession, nutation);
      let theta = Math.atan2(Math.sqrt(coords.x * coords.x + coords.y * coords.y), coords.z);
      let phi = Math.atan2(coords.y, coords.x);

      data.push({phi: phi, theta: theta});
    }
    return data;
  }

  sphere_angles_distance(a, b) {
    let c1 = this.calc_single_point(1, 0, 0, 0, a.precession, a.nutation);
    let c2 = this.calc_single_point(1, 0, 0, 0, b.precession, b.nutation);
    let scalar = c1.x * c2.x + c1.y * c2.y + c1.z * c2.z;
    let module = Math.sqrt(c1.x * c1.x + c1.y * c1.y + c1.z * c1.z) * Math.sqrt(c2.x * c2.x + c2.y * c2.y + c2.z * c2.z)
    return Math.acos(scalar / module);
  }
}
