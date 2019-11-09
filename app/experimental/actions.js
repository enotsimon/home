// @flow
import type { DrawerDebugInfoUnit } from 'experimental/drawer'

export const actionTick = (fps: number, delta: number, debugInfo: Array<DrawerDebugInfoUnit>) => ({
  type: 'actionTick',
  fps,
  delta,
  debugInfo,
})

// event type ???
export const actionMouseMove = (event: Object) => ({ type: 'actionMouseMove', event })
