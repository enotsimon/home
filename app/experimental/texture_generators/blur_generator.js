
import Util from 'common/util'
import * as Color from 'common/color'

// //////////////////////////////////////////////
// WARNING!!! doesnt work, rewite to BasicDrawer
// //////////////////////////////////////////////
export default class BlurGenerator {
  constructor() {
    this.map = game.map_drawer.map
    this.exp_container = new PIXI.Container()
    this.map.stage.addChild(this.exp_container)
  }

  exp_dots() {
    const points_count_coef = 0.0050
    let points_count = points_count_coef * this.map.view.width * this.map.view.height
    const radius_coef = 0.03
    const radius = radius_coef * Math.min(this.map.view.width, this.map.view.height)
    const count_near_threshold = points_count * radius_coef
    let steps_count = 10

    console.log('points_count', points_count, 'radius', radius, 'count_near_threshold', count_near_threshold)
    const points = []
    while (points_count--) {
      points.push({ x: Util.rand(0, this.map.view.width), y: Util.rand(0, this.map.view.height) })
    }
    let basic_color = [60, 30, 0]
    while (--steps_count) {
      basic_color = Color.brighter(basic_color, 20)
      this.exp_dots_step(radius, count_near_threshold / steps_count | 0, points, basic_color)
    }
    points.forEach(point => this.exp_dots_draw_circle(point.x, point.y, 2, [200, 100, 0]))
  }

  exp_dots_step(radius, count_near_threshold, points, color) {
    console.log('exp_dots_step radius', radius, 'threshold', count_near_threshold)
    let nears_sum = 10
    points.forEach(point => {
      const count_near = this.exp_dots_count_near(point, radius, points)
      nears_sum += count_near
      if (count_near >= count_near_threshold) {
        this.exp_dots_draw_circle(point.x, point.y, radius, color)
      }
    })
    console.log('near mid', nears_sum / points.length)
  }

  exp_dots_draw_circle(x, y, radius, color) {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(Color.to_pixi(color))
    graphics.drawCircle(x, y, radius)
    graphics.closePath()
    graphics.endFill()
    this.exp_container.addChild(graphics)
  }

  exp_dots_count_near(from, radius, points) {
    const filtered = points.filter(point => Util.distance(from, point) <= radius)
    return filtered.length - 1
  }
}
