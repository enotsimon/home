import Util from 'common/util'
import VoronoiDiagram from 'common/voronoi_diagram'
import Color from 'common/color'

export default class BallsGenerator {
  constructor(diagram, color_map, drawer) {
    this.diagram = diagram
    this.color_map = color_map
    this.drawer = drawer
  }

  generate() {
    let num_balls = 0.6 * this.drawer.map.view.width * this.drawer.map.view.height | 0
    console.log('num_balls', num_balls)
    const ball_radius_min = 1
    const ball_radius_max = 5
    const color_step = 5
    const color_count = 2
    const graphics = new PIXI.Graphics()
    while (num_balls--) {
      const rx = Util.rand(1, this.drawer.map.view.width - 1)
      const ry = Util.rand(1, this.drawer.map.view.height - 1)
      const cell = VoronoiDiagram.find({ x: rx, y: ry }, this.diagram)
      const base = this.color_map[cell.geo_type]
      const color = Color.random_near(base, color_step, color_count)
      const radius = Util.rand(ball_radius_min, ball_radius_max)
      graphics.beginFill(Color.to_pixi(color))
      graphics.drawCircle(rx, ry, radius)
      graphics.endFill()
    }
    const texture = graphics.generateCanvasTexture(PIXI.SCALE_MODES.LINEAR)
    const sprite = new PIXI.Sprite(texture)
    this.drawer.layers.geo.addChild(sprite)
  }
}
