
import Util from "common/util";
import Color from "common/color";
import BasicDrawer from "experimental/basic_drawer";
import * as PIXI from "pixi.js";

export default class MovingArrows extends BasicDrawer {
  constructor() {
    super('square');
  }

  init_graphics() {
    this.size_coef = 6;
    this.step = this.size / this.size_coef;
    this.matrix_size = 2 * this.size;
    this.arrows = [];
    this.angle = 0;
    this.angle_inc = 0;
    this.angle_inc_max = Math.PI / 60;
    this.acceleration = 0;
    this.speed = 0;
    this.max_speed = 20;
    this.color = [255, 255, 255];
    this.plan = [];
    this.matrix_container = new PIXI.Container();
    this.matrix_container.x = -this.step;
    this.matrix_container.y = -this.step;
    this.base_container.addChild(this.matrix_container);

    for (let y = -this.step; y < this.matrix_size; y += this.step) {
      for (let x = -this.step; x < this.matrix_size; x += this.step) {
        // git very bad quality on big scales, so we have to set it small and big font size
        let size = this.step * 9;
        let arrow = new PIXI.Text('⇨', {fontFamily: 'Arial', fontSize: size, fill: Color.to_pixi(this.color)});
        arrow.scale = {x: 0.1, y: 0.1};
        arrow.x = x;
        arrow.y = y;
        arrow.rotation = this.angle;
        this.arrows.push(arrow);
      }
    }
    this.arrows.forEach(arrow => this.matrix_container.addChild(arrow));
    console.log('this works');
  }


  redraw() {
    this.speed = .9;
    this.angle += this.angle_inc;
    if (Math.random() <= 0.1) {
      this.angle_inc = this.angle_inc_max * (2 * Math.random() - 1);
    }
    
    let radius = this.speed;
    let angle = this.angle;
    let diff = Util.from_polar_coords(angle, radius);
    this.arrows.forEach(arrow => {
      // TODO seems too complicated. is there better way?
      arrow.x = (arrow.x + diff.x) % this.matrix_size + (arrow.x < 0 ? this.matrix_size : 0);
      arrow.y = (arrow.y + diff.y) % this.matrix_size + (arrow.y < 0 ? this.matrix_size : 0);
      arrow.rotation = this.angle;
    });
  }
}

let app = new MovingArrows();
