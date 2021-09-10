// @flow
import type { DrawerDebugInfoUnit } from 'experimental/drawer'

export type ActionTick = {|
  type: 'actionTick',
  fps: number,
  delta: number,
  redrawTime: number,
  debugInfo: Array<DrawerDebugInfoUnit>,
|}

export type ActionMouseMove = {|
  type: 'actionMouseMove',
  event: Object,
|}

export const actionTick = (
  fps: number,
  delta: number,
  redrawTime: number,
  debugInfo: Array<DrawerDebugInfoUnit>
): ActionTick => ({
  type: 'actionTick',
  fps,
  delta,
  redrawTime,
  debugInfo,
})

// event type ???
export const actionMouseMove = (event: Object): ActionMouseMove => ({ type: 'actionMouseMove', event })
