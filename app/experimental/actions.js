// @flow
import type { DrawerDebugInfoUnit } from 'experimental/drawer'

export const actionTick = (fps: number, delta: number, redrawTime: number, debugInfo: Array<DrawerDebugInfoUnit>) => ({
  type: 'actionTick',
  fps,
  delta,
  redrawTime,
  debugInfo,
})

// event type ???
export const actionMouseMove = (event: Object) => ({ type: 'actionMouseMove', event })
