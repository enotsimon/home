
import Util from "util";
import Color from "color";

export default class MapDrawer {
  static layers() {
    // edges -- test for rivers by edges
    return [
      // cells filling
      'regions', 'geo', 'heights', 'dim_cells',
      // all items, objects, all that 'upon' the ground
      'borders', 'water', 'rrt_links', 'arrows', 'edges', 'roads', 'errors',
      // interaction routines
      'selection', 'under_cursor',
      // other
      'dim'
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
    this.layers = {};
    MapDrawer.layers().forEach(layer => {
      this.layers[layer] = new PIXI.Container();
      this.map.stage.addChild(this.layers[layer]);
    });
    document.getElementById('map_container').appendChild(this.map.view);
  }

  
  draw() {
    
  }

}
