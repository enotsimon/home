import Util from 'common/util'
import VoronoiDiagram from 'common/voronoi_diagram'
import * as d3 from 'd3'
import { game } from 'geo/game'

export default class Interaction {
  constructor() {
    this.cell_under_cursor = null
    this.state = 'initial'
  }

  init() {
    this.game = game
    document.getElementById('build_road').onclick = this.build_road_button_handler.bind(this)
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

    this.road_text_div = document.getElementById('road_text')

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


  change_state(state) {
    this.state = state
    if (state == 'initial') {
      d3.select('#road_text').html('')
      this.road_start_cell = null
    } else if (state == 'build_road_choose_start') {
      d3.select('#road_text').html('click road start cell')
      this.road_start_cell = null
    } else if (state == 'build_road_choose_finish') {
      d3.select('#road_text').html('click road finish cell')
    } else if (state == 'build_road') {
      // this.game.build_road(this.road_start_cell, this.road_finish_cell);
      console.log('suppose the road is built now')
      this.change_state('initial')
    }
  }


  //
  //  user actions handlers
  //
  build_road_button_handler(args) {
    this.change_state('build_road_choose_start')
  }

  map_mouse_move_handler(event) {
    if (event.target != this.map.view) {
      this.game.map_drawer.clear_cell_under_cursor()
      this.cell_under_cursor = null
      return false
    }
    const mouse_coords = this.get_mouse_coords(event)
    // TODO check if its fast enought
    const cell = this.get_cell_under_cursor(mouse_coords)
    if (!this.cell_under_cursor || this.cell_under_cursor != cell) {
      this.game.map_drawer.highlight_cell_under_cursor(cell)
      this.cell_under_cursor = cell
    }

    d3.select('#mouse_pos').html(`{x: ${mouse_coords.x}, y: ${mouse_coords.y}}`)
    const world_pos = this.mouse_coords_to_world_coords(mouse_coords)
    d3.select('#world_pos').html(`{x: ${world_pos.x}, y: ${world_pos.y}}`)
  }

  map_click_handler() {
    const mouse_coords = this.get_mouse_coords(d3.event)
    const cell = this.get_cell_under_cursor(mouse_coords)
    if (!cell) {
      console.log('dunno why, but no cell under cursor')
      return false
    }
    console.log('mouse click cell under cursor', cell)
    if (this.state == 'build_road_choose_start') {
      this.road_start_cell = cell
      this.change_state('build_road_choose_finish')
    } else if (this.state == 'click road finish cell') {
      this.road_finish_cell = cell
      this.change_state('build_road')
    }
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

  get_cell_under_cursor(mouse_coords) {
    const world_coords = this.mouse_coords_to_world_coords(mouse_coords)
    return VoronoiDiagram.find(world_coords, this.game.map_drawer.diagram)
  }


  mouse_coords_to_world_coords(mouse_coords) {
    const xn = Math.floor((mouse_coords.x - this.map.stage.position.x) / this.map.stage.scale.x)


    const yn = Math.floor((mouse_coords.y - this.map.stage.position.y) / this.map.stage.scale.y)
    return { x: xn, y: yn }
  }
}
