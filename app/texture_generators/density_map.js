import {game} from "game";
import Util from "util";
import Color from "color";
import * as d3 from "d3";

export default class DensityMap {
  constructor() {
    this.reject_limit = 500;
    this.average_distance_threshold = 0.05;
    this.zero_distance_sum = 0;
  }

  random_point(initial = false) {
    return {x: 2 * Math.random() - 1, y: 2 * Math.random() - 1, initial: initial};
  }

  generate(count, count_basic = 10) {
    let reject_counter = this.reject_limit;
    let total_rejects = 0;
    this.points = [];
    // basic points
    while (count_basic) {
      let point = this.random_point(true);
      if (this.check_in_circle(point)) {
        this.points.push(point);
        count_basic--;
      }
    }
    // regular points
    while (this.points.length < count) {
      let point = this.random_point(false);
      if (!this.check_in_circle(point)) {
        continue; // do not decrement reject_counter
      }
      if (!this.check_average_distance(point)) {
        reject_counter--;
        total_rejects++;
      } else {
        reject_counter = this.reject_limit;
        this.points.push(point);
        this.zero_distance_sum += Util.distance(point, {x: 0, y: 0});
      }
      if (!reject_counter) {
        console.log(`DensityMap.generate() reject limit ${this.reject_limit} reached, bailing out`);
        break;
      }
    }
    console.log('done, total_rejects: ', total_rejects);
    return true;
  }


  check_in_circle(point) {
    return Util.distance(point, {x: 0, y: 0}) <= 1;
  }


  calc_distance_sum(point) {
    return this.points.reduce((acc, e) => acc + Util.distance(point, e), 0);
  }

  check_average_distance(point) {
    //let sum = this.calc_distance_sum(point);
    //let value = this.zero_distance_sum / sum;
    let value = Util.find_min_and_max(this.points, (p) => Util.distance(p, point)).min;
    console.log('value', value);
    return value < this.average_distance_threshold;
  }



  draw(scale) {
    let graphics = new PIXI.Graphics();
    let radius = .01;
    let bla = Util.find_min_and_max(this.points, (p) => this.calc_distance_sum(p)).max;
    bla = Util.find_min_and_max(this.points, (p) => this.calc_distance_sum(p));
    let max_distance_sum = bla.max;
    let min_distance_sum = bla.min;

    this.points.forEach(point => {
      point.channel = Util.normalize_value(this.calc_distance_sum(point), max_distance_sum, 255, min_distance_sum) | 0;
    });
    this.points.sort((p1, p2) => p1.channel - p2.channel);

    this.points.forEach(point => {
      //let color = point.initial ? [125, 255, 0] : [point.channel, 0, 0];
      let color = point.initial ? [125, 255, 0] : [125, 0, 0];
      graphics.beginFill(Color.to_pixi(color));
      graphics.drawCircle(scale * point.x, scale * point.y, scale * radius);
      graphics.closePath();
      graphics.endFill();
    });

    return graphics;
  }


}