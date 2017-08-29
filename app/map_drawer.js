
import Util from "util";
import Color from "color";
import {game} from "game";

export default class MapDrawer {
  static layers() {
    return [
      'bodies',
      'errors',
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
    this.map.stage.addChild(this.base_container);
    this.base_container.position.x = width / 2 | 0;
    this.base_container.position.y = height / 2 | 0;

    this.layers = {};
    MapDrawer.layers().forEach(layer => {
      this.layers[layer] = new PIXI.Container();
      this.base_container.addChild(this.layers[layer]);
    });
    document.getElementById('map_container').appendChild(this.map.view);
  }

  
  draw() {
    this.init_stellar_body(game.star_system.star);
    game.star_system.planets.forEach(planet => this.init_stellar_body(planet));
  }

  init_stellar_body(stellar_body) {
    let graphics = new PIXI.Graphics();
    graphics.backlink = stellar_body;
    let coords = Util.from_polar_coords(stellar_body.orbital_angle, stellar_body.orbital_radius);
    graphics.beginFill(Color.to_pixi(stellar_body.color));
    graphics.drawCircle(0, 0, stellar_body.radius);
    graphics.endFill();
    graphics.position.x = coords.x;
    graphics.position.y = coords.y;
    graphics.rotation = stellar_body.angle;
    this.layers['bodies'].addChild(graphics);
    //console.log('DI', coords, stellar_body.orbital_angle, stellar_body.orbital_radius);
  }
}
