import Util from 'common/util'
import { game } from 'planets/game'
import * as d3 from 'd3'

export default class Interaction {
  constructor() {
    this.state = 'initial'
  }

  init() {
    this.game = game
    this.map = this.game.map_drawer.map
    this.map.stage.interactive = true

    document.addEventListener('mousemove', this.map_mouse_move_handler.bind(this), false)

    d3.select('#map').on('click', this.map_click_handler.bind(this))

    // from https://bl.ocks.org/pkerpedjiev/cf791db09ebcabaec0669362f4df1776
    d3.select('#map').call(
      d3.zoom()
        .scaleExtent([1, 4])
        .translateExtent([[0, 0], [this.map.view.width, this.map.view.height]])
        .on('zoom', this.map_zoom.bind(this))
    )

    this.ticks = 0 // here?
    this.fps_div = document.getElementById('fps_counter')
    this.map.ticker.add(() => {
      this.ticks++
      if (this.ticks % 10 == 0) {
        d3.select('#fps_counter').html(this.map.ticker.FPS | 0)
      }
    })
    this.update_map_scale()
  }


  map_mouse_move_handler(event) {
    if (event.target != this.map.view) {
      // this.game.map_drawer.clear_cell_under_cursor();
      // this.cell_under_cursor = null;
      return false
    }
    const mouse_coords = this.get_mouse_coords(event)

    d3.select('#mouse_pos').html(`{x: ${mouse_coords.x}, y: ${mouse_coords.y}}`)
    const world_pos = this.mouse_coords_to_world_coords(mouse_coords)
    d3.select('#world_pos').html(`{x: ${world_pos.x}, y: ${world_pos.y}}`)
  }

  map_click_handler() {
    const mouse_coords = this.get_mouse_coords(d3.event)
  }

  map_zoom() {
    this.map.stage.position.x = d3.event.transform.x
    this.map.stage.position.y = d3.event.transform.y
    this.map.stage.scale.x = d3.event.transform.k
    this.map.stage.scale.y = d3.event.transform.k
    this.update_map_scale()
  }
  // /////////////////////////////////////


  update_map_scale() {
    d3.select('#map_scale').html(`{x: ${this.map.stage.scale.x}, y: ${this.map.stage.scale.y}}`)
  }


  // /////////////////////////////////////
  // UTILS
  // /////////////////////////////////////
  get_mouse_coords(event) {
    return { x: event.offsetX, y: event.offsetY }
  }

  mouse_coords_to_world_coords(mouse_coords) {
    const xn = Math.floor((mouse_coords.x - this.map.stage.position.x) / this.map.stage.scale.x)


    const yn = Math.floor((mouse_coords.y - this.map.stage.position.y) / this.map.stage.scale.y)
    return { x: xn, y: yn }
  }
}
