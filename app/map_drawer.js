
import Util from "util";
import Color from "color";
import {game} from "game";

export default class MapDrawer {
  static layers() {
    return [
      'bodies',
      'errors',
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
    this.base_container.scale = {x: 6, y: 6};
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
    this.init_stellar_body(game.star_system.star);
    game.star_system.planets.forEach(planet => this.init_stellar_body(planet));

    this.clear_all();
    this.exp_dots();
  }

  redraw() {
    //this.bodies_graphics.forEach(graphics => this.update_stellar_body(graphics));
  }


  exp_dots() {
    this.exp_container = new PIXI.Container();
    this.map.stage.addChild(this.exp_container);
    let points_count_coef = .0050;
    let points_count = points_count_coef * this.map.view.width * this.map.view.height;
    let radius_coef = 0.03;
    let radius = radius_coef * Math.min(this.map.view.width, this.map.view.height);
    let count_near_threshold = points_count * radius_coef;
    let steps_count = 10;

    console.log('points_count', points_count, 'radius', radius, 'count_near_threshold', count_near_threshold);
    let points = [];
    while (points_count--) {
      points.push({x: Util.rand(0, this.map.view.width), y: Util.rand(0, this.map.view.height)});
    }
    let basic_color = [60, 30, 0];
    while (--steps_count) {
      basic_color = Color.brighter(basic_color, 20);
      this.exp_dots_step(radius, count_near_threshold / steps_count | 0, points, basic_color);
    }
    points.forEach(point => this.exp_dots_draw_circle(point.x, point.y, 2, [200, 100, 0]));
  }

  exp_dots_step(radius, count_near_threshold, points, color) {
    console.log('exp_dots_step radius', radius, 'threshold', count_near_threshold);
    let nears_sum = 10;
    points.forEach(point => {
      let count_near = this.exp_dots_count_near(point, radius, points);
      nears_sum += count_near;
      if (count_near >= count_near_threshold) {
        this.exp_dots_draw_circle(point.x, point.y, radius, color);
      }
    });
    console.log('near mid', nears_sum / points.length);
  }

  exp_dots_draw_circle(x, y, radius, color) {
    let graphics = new PIXI.Graphics();
    graphics.beginFill(Color.to_pixi(color));
    graphics.drawCircle(x, y, radius);
    graphics.closePath();
    graphics.endFill();
    this.exp_container.addChild(graphics);
  }

  exp_dots_count_near(from, radius, points) {
    let filtered = points.filter(point => Util.distance(from, point) <= radius);
    return filtered.length - 1;
  }



  init_stellar_body(stellar_body) {
    let graphics = new PIXI.Graphics();
    graphics.backlink = stellar_body;

    let line_color = Color.to_pixi(Color.darker(stellar_body.color, 30));
    graphics.lineStyle(stellar_body.radius / 10, line_color);
    graphics.beginFill(Color.to_pixi(stellar_body.color));
    graphics.drawCircle(0, 0, stellar_body.radius);
    graphics.closePath();
    graphics.endFill();

    this.small_circle(graphics, 0, 1, stellar_body, line_color);
    this.small_circle(graphics, 0, -1, stellar_body, line_color);
    this.small_circle(graphics, 1, 0, stellar_body, line_color);
    this.small_circle(graphics, -1, 0, stellar_body, line_color);

    this.layers['bodies'].addChild(graphics);
    this.bodies_graphics.push(graphics);
    this.update_stellar_body(graphics);
    //console.log('DI', coords, stellar_body.orbital_angle, stellar_body.orbital_radius);
  }

  update_stellar_body(graphics) {
    let stellar_body = graphics.backlink;
    let coords = Util.from_polar_coords(stellar_body.orbital_angle, stellar_body.orbital_radius);
    //console.log('SF', coords);
    graphics.position.x = coords.x;
    graphics.position.y = coords.y;
    graphics.rotation = stellar_body.angle;
  }


  small_circle(graphics, x, y, stellar_body, color) {
    graphics.lineStyle(stellar_body.radius / 10, Color.to_pixi([0, 0, 0]));
    graphics.beginFill(color);
    graphics.drawCircle(x * (stellar_body.radius / 2), y * (stellar_body.radius / 2), stellar_body.radius / 3);
    graphics.endFill();
  }
}
