// @flow
import { initSpringForce } from '../spring_force'

export const init = (): void => initSpringForce({
  COUNT_POINTS: 125,
  LINKS_LENGTH_MUL: 1000,
  FORCE_MUL: 0.18,
  REPULSING_FORCE_MUL: 0.1,
  REPULSING_FORCE_MAX_DIST_MUL: 0.2,
  SLOWDOWN_MUL: 0.7, // backward -- less value -- more slowdown
  CB_FORCE_MUL: 0.0018,
  MAX_SPEED_QUAD_TRIGGER: 0.06,
  CG_STEPS: 50,
  COLOR_BRIGHTEN_MAX: 100,
  COLOR_VALUES_LIST: [0, 50, 100],
  REBUILD_EVERY: 2500,
})
