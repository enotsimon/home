import Util from "util";
import {game} from "game";
import StellarBody from "stellar_body";
import Color from "color";

export default class StarSystem {
  constructor() {
    this.star = null;
    this.planets = [];
  }

  generate() {
    this.star = new StellarBody();
    this.star.radius = 10;
    this.star.rotation_speed = 10;
    this.star.color = Color.random_near([250, 50, 50]);

    let count_planets = 5;
    while (count_planets--) {
      let planet = new StellarBody();
      planet.orbital_radius = 10*(count_planets + 1);
      planet.radius = Util.rand(1, 5);
      planet.orbital_speed = Util.rand(1, 10);
      planet.rotation_speed = Util.rand(1, 10);
      planet.color = Color.random([200, 200, 200]);

      this.planets.push(planet);
    }
  }

  tick() {

  }
}
