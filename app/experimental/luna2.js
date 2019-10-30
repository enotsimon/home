
import Util from 'common/util'
import { createPlanetDrawer, calcSinglePoint } from 'experimental/planet_drawer'

import type { DrawerState } from 'experimental/drawer'

const sphereMap = (state: DrawerState): Array => {
  let map = []
  let count_craters = 50
  let i = 0
  let craters_data = []
  while (count_craters) {
    i += 1
    if (i > 1000) {
      throw ('too many cycles')
    }
    // rotation has no meaning in this case
    const precession = Util.rand_float(0, 2 * Math.PI)
    const nutation = Util.rand_float(0, 2 * Math.PI)
    const crater_diameter = Util.rand_float(Util.radians(1), Util.radians(15))
    const planet_radius = state.radius
    const crossing = craters_data.some(c => {
      const distance = crater_diameter + c.crater_diameter + Util.radians(2)
      return sphereAnglesDistance({ precession, nutation }, c) < distance
    })
    if (!crossing) {
      craters_data = [...craters_data, { precession, nutation, crater_diameter }]
      map = [...map, ...crater(planet_radius, crater_diameter, precession, nutation)]
      count_craters -= 1
    }
  }
  return map
}

const crater = (planet_radius, crater_diameter, precession, nutation) => {
  const data = []
  const angle_step = 2 * Math.PI / (1500 * crater_diameter)
  for (let a = 0; a <= 2 * Math.PI; a += angle_step) {
    const coords = calcSinglePoint(planet_radius, a, crater_diameter, 0, precession, nutation)
    const theta = Math.atan2(Math.sqrt(coords.x * coords.x + coords.y * coords.y), coords.z)
    const phi = Math.atan2(coords.y, coords.x)

    data.push({ phi, theta })
  }
  return data
}

const sphereAnglesDistance = (a, b) => {
  const c1 = calcSinglePoint(1, 0, 0, 0, a.precession, a.nutation)
  const c2 = calcSinglePoint(1, 0, 0, 0, b.precession, b.nutation)
  const scalar = c1.x * c2.x + c1.y * c2.y + c1.z * c2.z
  const sqSum = p => p.x * p.x + p.y * p.y + p.z * p.z
  const module = Math.sqrt(sqSum(c1)) * Math.sqrt(sqSum(c2))
  return Math.acos(scalar / module)
}

createPlanetDrawer(sphereMap)
