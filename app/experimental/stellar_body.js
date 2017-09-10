import Util from "common/util";
import {game} from "experimental/game";

export default class StellarBody {
  constructor() {
    this.orbital_radius = 0;
    this.radius = 0;
    this.orbital_speed = 0;
    this.rotation_speed = 0;
    // temp
    this.color = [0, 0, 0];

    this.orbital_angle = 0;
    this.angle = 0;
  }
}
