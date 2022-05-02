// @flow
// это собрание геометрических утилит
// родилось это для оптимизаций расчета всяких сил
// многое из utils.js надо перенести сюда
// import * as R from 'ramda'

// type Radians = number
// type Degrees = number

export type PolarPoint = {
  angle: number,
  radius: number,
}

export type XYPoint = { x: number, y: number }
export type SpeedPoint = { ...XYPoint, speed: XYPoint }
export type MassSpeedPoint = { ...SpeedPoint, mass: number }

const abs = x => Math.abs(x)

export const isInSquare = (side: number, { x, y }: XYPoint): boolean => abs(x) < side && abs(y) < side
export const isInLozenge = (side: number, { x, y }: XYPoint): boolean => abs(x) + abs(y) < side
