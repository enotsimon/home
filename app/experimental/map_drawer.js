
import Util from "common/util";
import Color from "common/color";
import {game} from "experimental/game";
import BlurGenerator from "experimental/texture_generators/blur_generator";
import PointsInCicrle from "experimental/texture_generators/points_in_circle";
import DensityMap from "experimental/texture_generators/density_map";
import Links from "experimental/texture_generators/links";

export default class MapDrawer {
  static layers() {
    return [
      'test',
    ];
  }

  init(width, height) {
    let PIXI = require('pixi.js');
    this.map = new PIXI.Application(width, height, {
      backgroundColor : Color.to_pixi([0, 0, 0]),
      antialias: true,
      view: document.getElementById('map'),
    });
    console.log('renderer', this.map.renderer);

    this.base_container = new PIXI.Container();
    this.base_container.scale = {x: 4, y: 4};
    this.map.stage.addChild(this.base_container);
    this.base_container.position.x = width / 2 | 0;
    this.base_container.position.y = height / 2 | 0;

    this.layers = {};
    MapDrawer.layers().forEach(layer => {
      this.layers[layer] = new PIXI.Container();
      this.base_container.addChild(this.layers[layer]);
    });
    document.getElementById('map_container').appendChild(this.map.view);
    this.bodies_graphics = [];


  }

  clear_all() {
    this.base_container.children.forEach(layer => layer.removeChildren());
  }

  init_graphics() {
    let points_count = 5000;
    //let tg = new PointsInCicrle();
    //let tg = new DensityMap();
    let tg = new Links();
    //tg.generate(points_count, PointsInCicrle.linear);
    //tg.generate(points_count, PointsInCicrle.pow);
    tg.generate(20);
    let func = (graphics, scale) => tg.draw_naive(graphics, scale);
    let container = tg.draw(80, func);
    //let container = tg.draw_triangles(50);
    this.layers['test'].addChild(container);
  }

  redraw() {
    
  }
}
