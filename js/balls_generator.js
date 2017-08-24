import Util from "js/util";
import VoronoiDiagram from "js/voronoi_diagram";
import Color from "js/color";

export default class BallsGenerator {
  constructor(diagram, color_map, drawer) {
    this.diagram = diagram;
    this.color_map = color_map;
    this.drawer = drawer;
  }

  generate() {
    let num_balls = 0.6 * this.drawer.map.view.width * this.drawer.map.view.height | 0;
    console.log('num_balls', num_balls);
    let ball_radius_min = 1;
    let ball_radius_max = 5;
    let color_step = 5;
    let color_count = 2;
    let graphics = new PIXI.Graphics();
    while (num_balls--) {
      let rx = Util.rand(1, this.drawer.map.view.width - 1);
      let ry = Util.rand(1, this.drawer.map.view.height - 1);
      let cell = VoronoiDiagram.find({x: rx, y: ry}, this.diagram);
      let base = this.color_map[cell.geo_type];
      let color = Color.random_near(base, color_step, color_count);
      let radius = Util.rand(ball_radius_min, ball_radius_max);
      graphics.beginFill(Color.to_pixi(color));
      graphics.drawCircle(rx, ry, radius);
      graphics.endFill();
    }
    let texture = graphics.generateCanvasTexture(PIXI.SCALE_MODES.LINEAR);
    let sprite = new PIXI.Sprite(texture);
    this.drawer.layers['geo'].addChild(sprite);
  }
}