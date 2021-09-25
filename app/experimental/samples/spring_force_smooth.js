// @flow
import { initSpringForce } from '../spring_force'

export const init = (): void => initSpringForce({
  COUNT_POINTS: 100,
  LINKS_LENGTH: 8,
  FORCE_MUL: 0.075,
  REPULSING_FORCE_MUL: 0.05,
  REPULSING_FORCE_MAX_DIST_MUL: 0.5,
  SLOWDOWN_MUL: 0.8, // backward -- less value -- more slowdown
  CB_FORCE_MUL: 0.0025,
  MAX_SPEED_QUAD_TRIGGER: 0.08,
  CG_STEPS: 50,
  COLOR_BRIGHTEN_MAX: 100,
  COLOR_VALUES_LIST: [0, 50, 100],
  REBUILD_EVERY: 2500,
})
