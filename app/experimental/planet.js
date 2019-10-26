
import Util from 'common/util'
import Color from 'common/color'
import BasicDrawer from 'experimental/basic_drawer'
import * as PIXI from 'pixi.js'

export default class Planet extends BasicDrawer {
  constructor() {
    super('circle')
  }

  update_debug_info() {
    return [
      { id: 'debug_info_precession', text: 'precession', value: Math.round(Util.degrees(this.precession)) },
      { id: 'debug_info_nutation', text: 'nutation', value: Math.round(Util.degrees(this.nutation)) },
      { id: 'debug_info_rotation', text: 'rotation', value: Math.round(Util.degrees(this.rotation)) },
      { id: 'debug_info_count_points', text: 'count points', value: this.points ? this.points.length : 0 },
    ]
  }

  init_graphics() {
    this.planet = new PIXI.Container()
    this.base_container.addChild(this.planet)

    this.radius = 0.9 * 0.5 * this.size
    this.rotation = null
    this.precession = null
    this.nutation = null
    this.points = this.init_graphics_from_sphere_map(this.sphere_map())
    this.map_transparency_alpha = 0.25
    this.draw_contour = true

    if (this.draw_contour) {
      const contour = new PIXI.Graphics()
      contour.lineStyle(1, Color.to_pixi([255, 255, 255]))
      contour.drawCircle(0, 0, this.radius)
      this.base_container.addChild(contour)
    }
  }

  redraw() {
    this.change_angles(this.ticks)
    this.points.forEach(point => {
      const coords = this.calc_single_point(
        this.radius,
        point.phi,
        point.theta,
        this.rotation,
        this.precession,
        this.nutation
      )
      point.graphics.alpha = coords.z < 0 ? this.map_transparency_alpha : 1
      point.graphics.x = coords.x
      point.graphics.y = coords.y
    })
  }

  calc_single_point(radius, phi, theta, rotation, precession, nutation) {
    const x = radius * Math.cos(phi) * Math.sin(theta)


    const y = radius * Math.sin(phi) * Math.sin(theta)


    const z = radius * Math.cos(theta)


    const sin_r = Math.sin(rotation); const cos_r = Math.cos(rotation)


    const sin_p = Math.sin(precession); const cos_p = Math.cos(precession)


    const sin_n = Math.sin(nutation); const cos_n = Math.cos(nutation)


    const cos_n_sin_r = cos_n * sin_r; const cos_n_cos_r = cos_n * cos_r


    const x2 = x * (cos_p * cos_r - sin_p * cos_n_sin_r) + y * (-cos_p * sin_r - sin_p * cos_n_cos_r) + z * (sin_p * sin_n)


    const y2 = x * (sin_p * cos_r + cos_p * cos_n_sin_r) + y * (-sin_p * sin_r + cos_p * cos_n_cos_r) + z * (-cos_p * sin_n)


    const z2 = x * (sin_n * sin_r) + y * (sin_n * cos_r) + z * cos_n
    return { x: x2, y: y2, z: z2 }
  }

  change_angles(ticks) {
    this.rotation = Util.radians(0) + ticks * (2 * Math.PI / 360)
    this.precession = Util.radians(30) + Util.radians(15) * Math.sin(2 * ticks / 360)
    this.nutation = Util.radians(90 - 30) + Util.radians(15) * Math.cos(2 * ticks / 360)
  }

  sphere_map() {
    return [...Array(500).keys()].map(i => {
      return {
        phi: Util.rand_float(0, 2 * Math.PI),
        theta: Util.rand_float(0, 2 * Math.PI),
      }
    })
  }

  init_graphics_from_sphere_map(sphere_map) {
    return sphere_map.map(e => {
      e.graphics = new PIXI.Graphics()
      e.graphics.beginFill(Color.to_pixi([255, 255, 255]), 1)
      e.graphics.drawRect(0, 0, 0.0025 * this.size, 0.0025 * this.size)
      e.graphics.endFill()
      this.planet.addChild(e.graphics)
      return e
    })
  }
}
