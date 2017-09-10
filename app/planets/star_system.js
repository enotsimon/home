import Util from "common/util";
import {game} from "planets/game";
import StellarBody from "planets/stellar_body";
import Color from "common/color";

export default class StarSystem {
  constructor() {
    this.star = null;
    this.planets = [];

    this.orbital_speed_coef = 0.0025;
    this.rotation_speed_coef = 0.01;
  }

  generate() {
    this.star = new StellarBody();
    this.star.radius = 8;
    this.star.rotation_speed = this.rotation_speed_coef * Util.rand(1, 10);
    this.star.color = Color.random_near([250, 50, 50]);

    let count_planets = 5;
    while (count_planets--) {
      let planet = new StellarBody();
      planet.orbital_radius = 10*(count_planets + 2);
      planet.radius = Util.rand(1, 5);
      planet.orbital_speed = this.orbital_speed_coef * Util.rand(1, 10);
      planet.rotation_speed = this.rotation_speed_coef * Util.rand(1, 10);
      planet.color = Color.random([200, 200, 200]);

      this.planets.push(planet);
    }
  }

  tick() {
    this.update_stellar_body(this.star);
    this.planets.forEach(planet => this.update_stellar_body(planet));
  }

  update_stellar_body(body) {
    body.orbital_angle += body.orbital_speed;
    body.angle += body.rotation_speed;
  }
}
