
import Util from 'common/util'
import Color from 'common/color'
import BasicDrawer from 'experimental/basic_drawer'
import * as PIXI from 'pixi.js'

/**
 *
 */
export default class Tableau extends BasicDrawer {
  constructor() {
    super('square')
    this.x_size = 100
    this.y_size = 100
  }

  init_graphics() {
    this.color_change_per_tick = 8
    this.data = []
    const square_size = Math.min(this.size / this.x_size, this.size / this.y_size)
    for (let y = 0; y < this.y_size; y++) {
      this.data[y] = []
      for (let x = 0; x < this.x_size; x++) {
        const graphics = new PIXI.Graphics()
        graphics.beginFill(Color.to_pixi([255, 255, 255]))
        graphics.drawRect(
          Util.normalize_value(x, this.x_size, this.size),
          Util.normalize_value(y, this.y_size, this.size),
          square_size,
          square_size
        )
        graphics.endFill()
        this.base_container.addChild(graphics)
        this.data[y][x] = {
          x,
          y,
          color: 0,
          new_color: 0,
          graphics,
        }
      }
    }
    this.init_state()
    this.update_cells()
  }

  redraw() {
    this.mutate_state()
    this.update_cells()
  }

  update_cells() {
    this.for_all_elements(element => element.graphics.alpha = element.color)
  }

  for_all_elements(func) {
    this.data.forEach(line => {
      line.forEach(element => {
        func(element)
      })
    })
  }

  init_state() {
    this.for_all_elements(element => this.init_element_state(element))
  }

  init_element_state(element) {
    element.color = Math.random()
  }

  mutate_state() {
    this.for_all_elements(element => this.mutate_element_state(element))
    this.for_all_elements(element => element.color = element.new_color)
  }

  // this func suppose to change new_color prop, not color!
  mutate_element_state(element) {
    element.new_color = (element.color + (this.color_change_per_tick / 256)) % 1
  }

  get_element_color(x, y, out_of_border_func) {
    return this.data[y] && this.data[y][x] ? this.data[y][x].color : out_of_border_func(x, y)
  }
}
