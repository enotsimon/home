import {game} from "experimental/game";
import Util from "common/util";
import Color from "common/color";
import * as d3 from "d3";

export default class Links {
  constructor() {
    this.angle = Math.PI / 60;
    this.points = [];
  }

  random_point() {
    return {x: 2 * Math.random() - 1, y: 2 * Math.random() - 1};
  }

  generate(size = 20) {
    for (let a = 0; a < Math.PI * 2; a += this.angle) {
      let point = Util.from_polar_coords(a, 1);
      point.on_border = true;
      this.points.push(point);
    }
    let step = (1 - -1)/size;
    for (let y = -1; y < 1; y += step) {
      for (let x = -1; x < 1; x += step) {
        let point = {x: x, y: y, on_border: false};
        if (!this.check_in_circle(point)) {
          continue;
        }
        this.points.push(point);
      }
    }
    this.points.forEach(point => {
      
    });
  }


  check_in_circle(point) {
    return Util.distance(point, {x: 0, y: 0}) < 1;
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
      let color = [255, 0, 0];
      graphics.beginFill(Color.to_pixi(color));
      graphics.drawCircle(scale * point.x, scale * point.y, scale * radius);
      graphics.closePath();
      graphics.endFill();
    });
  }
}