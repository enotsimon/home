import {game} from "experimental/game";
import Util from "common/util";
import Color from "common/color";
import * as d3 from "d3";

export default class Links {
  constructor() {
    this.angle = Math.PI / 30;
    this.points = [];
    this.size = 20;
  }

  random_point() {
    return {x: 2 * Math.random() - 1, y: 2 * Math.random() - 1};
  }

  generate() {
    for (let a = 0; a < Math.PI * 2; a += this.angle) {
      let point = Util.from_polar_coords(a, 1);
      point.on_border = true;
      this.points.push(point);
    }
    let step = this.calc_step();
    for (let y = -1; y < 1; y += step) {
      for (let x = -1; x < 1; x += step) {
        let point = {x: x, y: y, on_border: false};
        if (!this.check_in_circle(point, 1 - step/2)) {
          continue;
        }
        this.points.push(point);
      }
    }
    this.points.forEach(point => {
      
    });
  }


  check_in_circle(point, radius = 1) {
    return Util.distance(point, {x: 0, y: 0}) < radius;
  }

  calc_step() {
    return (1 - -1)/this.size;
  }

  draw(scale, func = this.draw_naive.bind(this)) {
    let graphics = new PIXI.Graphics();
    func(scale, graphics);
    return graphics;
  }


  draw_naive(scale, graphics) {
    let step = this.calc_step();
    let radius = step / 6;
    this.points.forEach(point => {
      let color = [150, 0, 0];
      graphics.beginFill(Color.to_pixi(color));
      graphics.drawCircle(scale * point.x, scale * point.y, scale * radius);
      graphics.closePath();
      graphics.endFill();
    });
  }
}