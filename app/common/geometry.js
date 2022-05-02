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

// я пробовал всякие оптимизации -- быстрые сравнения на границы кватдаров, ромбов
// но эта функция быстрее их! видимо движок оптимизирует лучше меня
export const isInCircle = (radius: number, { x, y }: XYPoint): boolean => (x ** 2) + (y ** 2) < radius ** 2
