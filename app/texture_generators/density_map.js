import {game} from "game";
import Util from "util";
import Color from "color";
import * as d3 from "d3";

export default class DensityMap {
  constructor() {
    this.reject_limit = 50;
    this.average_distance_threshold = 0.25;
  }


  generate(count, count_basic = 10) {
    let reject_counter = this.reject_limit;
    this.points = [];
    // basic points
    while (count_basic) {
      let point = {x: Math.random(), y: Math.random()};
      if (this.check_in_circle(point)) {
        this.points.push(point);
        count_basic--;
      }
    }
    // regular points
    while (this.points.length < count) {
      let point = {x: Math.random(), y: Math.random()};
      if (!this.check_in_circle(point)) {
        continue; // do not decrement reject_counter
      }
      if (!this.check_average_distance(point)) {
        reject_counter--;
        console.log('now reject count', reject_counter);
      } else {
        reject_counter = this.reject_limit;
        this.points.push(point);
        console.log('now push', this.points.length);
      }
      if (!reject_counter) {
        console.log(`DensityMap.generate() reject limit ${this.reject_limit} reached, bailing out`);
        break;
      }
    }
    return true;
  }


  check_in_circle(point) {
    return Util.distance(point, {x: 0, y: 0}) <= 1;
  }


  check_average_distance(point) {
    let sum = this.points.reduce((acc, e) => acc + Util.distance(point, e), 0);
    let average = sum / this.points.length;
    console.log('average', average, Math.random() * average);
    return Math.random() * average < this.average_distance_threshold;
  }



  draw(scale, color = [150, 75, 0]) {

  }

}