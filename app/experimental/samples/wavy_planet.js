// @flow
import random from 'random'
import seedrandom from 'seedrandom'
import { initPlanetDrawer } from 'experimental/planet_drawer'

import type { SphereMapBuilder } from 'experimental/planet_drawer'

const seed = Date.now()
random.use(seedrandom(seed))

const sinRing = (amplitude, altitude, countWaves) => {
  const map = []
  const steps = 1000
  for (let t = 0; t < 2 * Math.PI; t += 2 * Math.PI / steps) {
    const theta = altitude + amplitude * Math.sin(countWaves * t)
    const phi = t
    map.push({ phi, theta })
  }
  return map
}

const sphereMap: SphereMapBuilder = () => {
  let map = []
  const step = 2 * Math.PI / 36
  const amplitude = random.float(0.1 * step, 0.5 * step)
  let countWaves = random.int(2, 10)
  for (let altitude = 1 * step; altitude < 2 * Math.PI / 2 - step; altitude += step) {
    countWaves = (altitude / step) || 0
    map = map.concat(sinRing(amplitude, altitude, countWaves))
  }
  return map
}

export const initWavyPlanet = (): void => initPlanetDrawer(sphereMap, 0)
