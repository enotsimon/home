
import Util from 'common/util'
import Color from 'common/color'
import BasicDrawer from 'experimental/basic_drawer'
import * as PIXI from 'pixi.js'
import Planet from 'experimental/planet'

export default class PlanetExp extends Planet {
  init_graphics() {
    super.init_graphics()
    this.map_transparency_alpha = 0
  }

  sphere_map() {
    const map = []
    const step = 2.5 * 2 * Math.PI / 360
    let parallel_num = 0
    const count_parallels = 2 * Math.PI / step | 0
    for (let theta = 0; theta < 2 * Math.PI; theta += step) {
      const count_points = 2 * Math.min(parallel_num, count_parallels - parallel_num) + 1
      const phi_step = 2 * Math.PI / count_points
      console.log('phi_step', parallel_num, count_points)
      for (let phi = 0; phi < 2 * Math.PI; phi += phi_step) {
        map.push({ phi, theta })
      }
      parallel_num++
    }
    return map
  }
}
