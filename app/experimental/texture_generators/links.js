
import Util from 'common/util'
import * as Color from 'enot-simon-utils/lib/color'
import * as d3 from 'd3'

// //////////////////////////////////////////////
// WARNING!!! doesnt work, rewite to BasicDrawer
// //////////////////////////////////////////////
export default class Links {
  constructor() {
    this.points = []
    this.size = 10
    const angle_divider = 1.5 * this.size | 0
    this.angle = Math.PI / angle_divider
    console.log(`Links size: ${this.size}, angle divider: ${angle_divider}`)
  }

  random_point() {
    return { x: 2 * Math.random() - 1, y: 2 * Math.random() - 1 }
  }

  generate() {
    const border_points = []
    const grid_points = []
    for (let a = 0; a < Math.PI * 2; a += this.angle) {
      const point = Util.from_polar_coords(a, 1)
      point.on_border = true
      this.points.push(point)
      border_points.push(point)
    }
    const step = this.calc_step()
    for (let y = -1; y < 1; y += step) {
      for (let x = -1; x < 1; x += step) {
        const point = { x, y, on_border: false }
        if (!this.check_in_circle(point, 1 - step / 2)) {
          continue
        }
        this.points.push(point)
        grid_points.push(point)
      }
    }

    const all_points = grid_points.concat(border_points)
    grid_points.forEach(point => point.links = all_points.filter(p => Util.distance(point, p) <= 1.5 * step))
    const open_list = grid_points.slice()
    // note that we process only grid points!
    this.process_links(open_list)
  }

  process_links(open_list) {
    if (!open_list.length) {
      return
    }
    const element = Util.rand_element(open_list)
    if (element.links.length < 2) {
      throw ('bad element, less than 2 links')
    }
    const count_border = element.links.filter(e => e.on_border).length
    // if only one link to border point left, dont delete it
    const links_to_process = count_border > 1 ? element.links : element.links.filter(e => !e.on_border)
    const link_to_delete = Util.rand_element(links_to_process)
    Util.remove_element(link_to_delete, element.links)
    if (element.links.length <= 2) {
      Util.remove_element(element, open_list)
    }
    // on-border points dont have links
    if (!link_to_delete.on_border) {
      if (!Util.remove_element(element, link_to_delete.links)) {
        console.log('WARNING! linked element had no backlink', link_to_delete, element)
      }
      if (link_to_delete.links.length < 2 && !link_to_delete.on_border) {
        console.log('too bad but some point now has less that 2 links', link_to_delete)
      }
      if (link_to_delete.links.length <= 2) {
        Util.remove_element(link_to_delete, open_list)
      }
    }
    this.process_links(open_list)
  }

  check_in_circle(point, radius = 1) {
    return Util.distance(point, { x: 0, y: 0 }) < radius
  }

  calc_step() {
    return (1 - -1) / this.size
  }


  draw(scale, func = this.draw_naive.bind(this)) {
    const graphics = new PIXI.Graphics()
    // graphics.scale = {x: scale, y: scale};
    func(graphics, scale)
    return graphics
  }


  draw_naive(graphics, scale = 1) {
    const step = this.calc_step()
    const radius = step / 6
    const color = [30, 0, 0]

    this.points.forEach(point => {
      graphics.beginFill(Color.to_pixi(color))
      graphics.drawCircle(scale * point.x, scale * point.y, scale * radius)
      graphics.closePath()
      graphics.endFill()

      if (point.links) {
        point.links.forEach(link => {
          graphics.lineStyle(scale * step / 10, Color.to_pixi(color))
          graphics.moveTo(scale * point.x, scale * point.y)
          graphics.lineTo(scale * link.x, scale * link.y)
          graphics.closePath()
          graphics.lineStyle(0, Color.to_pixi(color))
        })
      }
    })
  }
}
