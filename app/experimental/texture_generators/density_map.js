import {game} from "experimental/game";
import Util from "common/util";
import Color from "common/color";
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
    let value = Util.find_min_and_max(this.points, (p) => Util.distance(p, point)).min;
    //console.log('value', value);
    // its like some little chanse for far points
    let rand = value * Math.pow(Math.random(), 100);
    return value < this.average_distance_threshold + rand;
  }



  draw(scale, func = this.draw_naive.bind(this)) {
    let graphics = new PIXI.Graphics();
    func(scale, graphics);
    return graphics;
  }


  draw_naive(scale, graphics) {
    let radius = .01;
    this.points.forEach(point => {
      //let color = point.initial ? [125, 255, 0] : [point.channel, 0, 0];
      let color = point.initial ? [125, 255, 0] : [125, 0, 0];
      graphics.beginFill(Color.to_pixi(color));
      graphics.drawCircle(scale * point.x, scale * point.y, scale * radius);
      graphics.closePath();
      graphics.endFill();
    });
  }

  draw_density_grid(scale, graphics, size = 100) {
    let step = (1 - -1)/size;
    let grid_points = [];
    for (let y = -1; y < 1; y += step) {
      for (let x = -1; x < 1; x += step) {
        let grid_point = {x: x, y: y, density: 0};
        if (!this.check_in_circle(grid_point)) {
          continue;
        }
        grid_point.density = this.points.filter(p => p.x >= x && p.y >= y && p.x < x + step && p.y < y + step).length;
        grid_points.push(grid_point);
      }
    }
    let max_density = Util.find_min_and_max(grid_points, (p) => p.density).max;
    grid_points.forEach(point => {
      let channel = Util.normalize_value(point.density, max_density, 255, 0, 20);
      graphics.beginFill(Color.to_pixi([channel, 0, 0]));
      graphics.drawCircle(scale * point.x, scale * point.y, scale * (step / 2));
      graphics.closePath();
      graphics.endFill();
    });
  }
}