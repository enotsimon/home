// @flow
import random from 'random'
import * as R from 'ramda'

/**
 * its a copy-paste of old util.js but refactored
 * plus some new
 */
type Radians = number
type Degrees = number

export type PolarPoint = {|
  angle: number,
  radius: number,
|}

export type XYPoint = {|
  x: number,
  y: number,
|}

export type LineFormula = { a: number, b: number, c: number }

// dont use it!!!
export const execInCycleWithDelay = (
  index: number,
  limit: number,
  delay: number,
  func: (number) => void,
  final_func: (number) => void = () => {}
) => {
  if ((typeof limit === 'function' && !limit()) || (index >= limit)) {
    final_func(index)
    return
  }
  func(index)
  setTimeout(() => { execInCycleWithDelay(index + 1, limit, delay, func, final_func) }, delay)
}

export const randElement = (arr: Array<any>) => {
  if (arr.length === 0) return false
  return arr[random.int(0, arr.length - 1)]
}

export const normalizeValue = (
  value: number,
  max: number,
  normal_max: number,
  min: number = 0,
  normal_min: number = 0
): number => {
  if (value > max || value < min) {
    console.log('value out of range', value, max, normal_max, min, normal_min)
    throw ('value out of range')
  }
  return (value - min) * (normal_max - normal_min) / (max - min) + normal_min
}

// ////////////////////////////////////////
// geometry
// ////////////////////////////////////////

// TODO rewrite to XYPoint
export const toPolarCoords = <T: { ...XYPoint }>({ x, y }: T): PolarPoint => {
  const radius = Math.sqrt(x * x + y * y)
  const angle = Math.atan2(y, x)
  return { angle, radius }
}

// TODO rewrite to PolarPoint
export const fromPolarCoords = <T: { ...PolarPoint }>({ angle, radius }: T): XYPoint => {
  const x = radius * Math.cos(angle)
  const y = radius * Math.sin(angle)
  return { x, y }
}

export const radians = (deg: Degrees): Radians => deg * Math.PI / 180

export const degrees = (rad: Radians): Degrees => rad * 180 / Math.PI

export const anglesDiff = (a: Radians, b: Radians): Radians => {
  const diff = Math.abs(a - b)
  return Math.min(diff, 2 * Math.PI - diff)
}

// length -- usually from 0 to 1
export const moveByVector = (from: XYPoint, to: XYPoint, length: number): XYPoint => {
  // why i wrote j_max + 1? thats for last gradient area -- otherwise it will be just a single dot
  return { x: from.x + (to.x - from.x) * length, y: from.y + (to.y - from.y) * length }
}


export const convexPolygonCentroid = (points: Array<XYPoint>): XYPoint => {
  const p1 = points[0]
  let square_sum = 0
  let xc = 0; let
    yc = 0
  for (let i = 1; i < points.length - 1; i + 1) {
    const p2 = points[i]
    const p3 = points[i + 1]
    const square = ((p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)) / 2 // triangle square
    square_sum += square
    xc += square * (p1.x + p2.x + p3.x) / 3
    yc += square * (p1.y + p2.y + p3.y) / 3
  }
  return { x: xc / square_sum, y: yc / square_sum }
}

/**
 * square of convex polygon. points should be sorted by angle to center!!!
 */
export const convexPolygonSquare = (points: Array<XYPoint>): number => {
  const p1 = points[0]
  let square = 0
  for (let i = 1; i < points.length - 1; i + 1) {
    const p2 = points[i]
    const p3 = points[i + 1]
    square += Math.abs((p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)) / 2
  }
  return square
}

export const distance = <T: { ...XYPoint }>(p1: T, p2: T): number => {
  return Math.sqrt(((p1.x - p2.x) ** 2) + ((p1.y - p2.y) ** 2))
}

export const gaussFunction = (x: number, sigma: number, mu: number): number => {
  /* eslint-disable-next-line no-restricted-properties */
  return 1 / (sigma * Math.sqrt(2 * Math.PI)) * Math.pow(Math.E, -(Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2))))
}

/**
 * angle between three points where b is apex (middle point)
 */
export const angleBy3Points = (a: XYPoint, b: XYPoint, c: XYPoint): Radians => {
  const ab = { x: b.x - a.x, y: b.y - a.y }
  const cb = { x: b.x - c.x, y: b.y - c.y }
  const dot = (ab.x * cb.x + ab.y * cb.y) // dot product
  const cross = (ab.x * cb.y - ab.y * cb.x) // cross product
  const alpha = Math.atan2(cross, dot)
  return alpha
  // return (int) floor(alpha * 180. / pi + 0.5);
}

export const findNearestPoint = <T1: { ...XYPoint }, T2: { ...XYPoint }>(target: T1, points: Array<T2>): T2 => {
  if (points.length === 0) {
    throw ('empty points array')
  }
  const maped = R.map(p => [p, distance(p, target)])(points)
  return R.reduce(([aN, aD], [cN, cD]) => (cD < aD ? [cN, cD] : [aN, aD]), maped[0], maped)[0]
}

// take two points and find formula of line between them in (ax + by + c = 0) style
// TODO TEST
export const lineFormula = <T: { ...XYPoint }>(p1: T, p2: T): LineFormula => {
  // (y1 - y2) * x + (x2 - x1) * y + (x1*y2 -x2*y1) = 0 ((ax + by + c = 0))
  const a = p1.y - p2.y
  const b = p2.x - p1.x
  const c = p1.x * p2.y - p2.x * p1.y
  // resulting line is the same. we do that for comparing formulae
  return (a >= 0) ? { a, b, c } : { a: -a, b: -b, c: -c }
}

// calculates two lines cross point lines taken by their a,b,c coef in (ax + by + c = 0) style
// TODO TEST
export const linesCrossPoint = (f1: LineFormula, f2: LineFormula): ?XYPoint => {
  // console.log('F', f1, f2);
  const tmp = (f1.a * f2.b - f2.a * f1.b)
  // they are parallel
  if (tmp === 0) {
    return null
  }
  const x = -(f1.c * f2.b - f2.c * f1.b) / tmp
  const y = -(f1.a * f2.c - f2.a * f1.c) / tmp
  return { x, y }
}

//
// random points
//
export const randomPointsPolarNaive = (count: number, scale: number = 1): Array<XYPoint> => R.map(() => {
  const angle = random.float(0, 2 * Math.PI)
  const radius = random.float(0, scale)
  return fromPolarCoords({ angle, radius })
})(R.range(0, count))

export const randomPointsInSquare = (count: number, scale: number = 1): Array<XYPoint> => R.map(() => {
  return { x: random.float(0, scale), y: random.float(0, scale) }
})(R.range(0, count))

export const randomPointPolar = (radius: number = 1): PolarPoint =>
  ({ angle: 2 * Math.PI * random.float(), radius: radius * Math.sqrt(random.float()) })

export const randomPointInSquare = (scale: number = 1): XYPoint =>
  ({ x: random.float(0, scale), y: random.float(0, scale) })

// ??? experimental. some standard routine for cyclic openList processing
/*
export const doWhileNotEmpty = (openList: Array<any>, func): boolean => {
  let length_before
  let step = 0
  do {
    length_before = openList.length
    openList = openList.filter(element => !func(element, step++))
    if (length_before == openList.length) {
      console.log('do_while_not_empty() openList length not chenged, bailing out', length_before, openList)
      return false
    }
  } while (openList.length)
  return true
}
*/

/*
FROM trees_util
curve_thru_points(context, path) {
  let sp = {x: (path[0].x + path[1].x)/2, y: (path[0].y + path[1].y)/2};
  context.moveTo(path[0].x, path[0].y);
  context.lineTo(sp.x, sp.y);
  for (let i = 2; i < path.length; i++) {
    let p = {x: (path[i-1].x + path[i].x)/2, y: (path[i-1].y + path[i].y)/2};
    context.quadraticCurveTo(path[i-1].x, path[i-1].y, p.x, p.y);
  }
  let l = path.length-1;
  context.lineTo(path[l].x, path[l].y);
}

// array of points to draw petals "star"
// frame_factor -- cur_frame / max_frame_value
// TODO: big radius points do not depend on frame, can move them out
path_petals(frame, angle_step, start_angle, big_radius, width, frame_factor) {
  let small_radius = 0.13*width * frame_factor
  let focus = (big_radius - small_radius) / 2 + small_radius;
  let path = [];
  let xf1, yf1, xf2, yf2, xb, yb, xs, ys
  for (let angle = 0; angle < 2*Math.PI; angle += angle_step) {
    let rotated_angle = angle + start_angle; // o my god, we need vertical top petal
    let xf_factor = 0.2 * frame / 100;
    [xf1, yf1] = this.from_polar_coords(rotated_angle - xf_factor, focus);
    [xf2, yf2] = this.from_polar_coords(rotated_angle + xf_factor, focus);
    [xb, yb] = this.from_polar_coords(rotated_angle, big_radius);
    [xs, ys] = this.from_polar_coords(rotated_angle + angle_step/2, small_radius);
    path.push([xf1, yf1, xb, yb]);
    path.push([xf2, yf2, xs, ys]);
  }
  return path;
}

// finds ammm... dunno how to say -- side of given point against line
point_side_to_line(point, formula) {
  let ret = formula.a * point.x + formula.b * point.y + formula.c;
  // !!! well, we encounter real troubles with small values, quite often
  if (Math.abs(ret) < 0.00000001) { return 0; }
  return ret;
}

perpendicular_bisector_formula(p1, p2) {
  return {
    a: p2.x - p1.x,
    b: p2.y - p1.y,
    c: (Math.pow(p1.x, 2) - Math.pow(p2.x, 2) + Math.pow(p1.y, 2) - Math.pow(p2.y, 2))/2
  };
}

plane_formula(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
  let A = y1*(z2 - z3) + y2*(z3 - z1) + y3*(z1 - z2),
      B = z1*(x2 - x3) + z2*(x3 - x1) + z3*(x1 - x2),
      C = x1*(y2 - y3) + x2*(y3 - y1) + x3*(y1 - y2),
      D = -1*( x1*(y2*z3 - y3*z2) + x2*(y3*z1 - y1*z3) + x3*(y1*z2 - y2*z1) );
  return [A, B, C, D];
}
*/
