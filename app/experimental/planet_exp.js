// @flow
import { createPlanetDrawer } from 'experimental/planet_drawer'

import type { SphereMapBuilder } from 'experimental/planet_drawer'

const sphereMap: SphereMapBuilder = () => {
  const map = []
  const step = 2.5 * 2 * Math.PI / 360
  let parallel_num = 0
  const count_parallels = (2 * Math.PI / step) || 0
  for (let theta = 0; theta < 2 * Math.PI; theta += step) {
    const count_points = 2 * Math.min(parallel_num, count_parallels - parallel_num) + 1
    const phi_step = 2 * Math.PI / count_points
    console.log('phi_step', parallel_num, count_points)
    for (let phi = 0; phi < 2 * Math.PI; phi += phi_step) {
      map.push({ phi, theta })
    }
    parallel_num += 1
  }
  return map
}

createPlanetDrawer(sphereMap, 0)
