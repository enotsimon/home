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
export type PolarPInex = { ...PolarPoint }

export type XYPoint = {|
  x: number,
  y: number,
|}
export type XYPInex = { ...XYPoint }

export type LineFormula = { a: number, b: number, c: number }

export type ArrOrObj<T, Id: string | number> = Array<T> | {| [Id]: T |}

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

export const randElement = <T>(arr: Array<T>): T => {
  if (arr.length === 0) {
    throw new Error('randElement input array cannot be empty')
  }
  return arr[random.int(0, arr.length - 1)]
}

const filterSame = <T>(list: Array<[T, T]>): Array<[T, T]> => R.filter(([v1, v2]) => !R.equals(v1, v2), list)
const noOrderPairsFilterSame = <T>(list: Array<T>, filter: boolean): Array<[T, T]> => {
  return pairs(list).reduce(([acc, closeList], [e1, e2]) => {
    // $FlowIgnore
    const p1 = `${JSON.stringify(e1)}|${JSON.stringify(e2)}`
    // $FlowIgnore
    const p2 = `${JSON.stringify(e2)}|${JSON.stringify(e1)}`
    if (filter && p1 === p2) {
      return [acc, closeList]
    }
    if (!closeList[p1] && !closeList[p2]) {
      acc.push([e1, e2])
    }
    // clone closeList all the time is very expensive, have to reassing input args
    /* eslint-disable-next-line no-param-reassign */
    closeList[p1] = 1
    /* eslint-disable-next-line no-param-reassign */
    closeList[p2] = 1
    return [acc, closeList]
  }, [[], {}])[0]
}
export const pairs = <T>(list: Array<T>): Array<[T, T]> => R.chain(e1 => R.map(e2 => [e1, e2], list), list)
export const noSameValuesPairs = <T>(list: Array<T>): Array<[T, T]> => filterSame(pairs(list))
export const noOrderPairs = <T>(list: Array<T>): Array<[T, T]> => noOrderPairsFilterSame(list, false)
export const noOrderNoSameValuesPairs = <T>(list: Array<T>): Array<[T, T]> => noOrderPairsFilterSame(list, true)

export const shuffle = <T: any>(arr: Array<T>): Array<T> => arr.sort(() => random.int(0, 2) - 1)

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

export const forSublist = <T, Id: string | number>(
  data: ArrOrObj<T, Id>,
  sublist: Array<string | number>, // Array<Id> but flow error
  func: (T) => T,
  prop: string = 'id'
): ArrOrObj<T, Id> => {
  const sublistInd = R.indexBy(e => e.toString(), sublist)
  // $FlowIgnore
  return R.map(e => {
    if (sublistInd[e[prop]]) {
      return func(e)
    }
    return e
  }, data)
}

// ////////////////////////////////////////
// geometry
// ////////////////////////////////////////

// TODO rewrite to XYPoint
export const toPolarCoords = ({ x, y }: XYPInex): PolarPoint => {
  const radius = Math.sqrt(x * x + y * y)
  const angle = Math.atan2(y, x)
  return { angle, radius }
}

// TODO rewrite to PolarPoint
export const fromPolarCoords = ({ angle, radius }: PolarPInex): XYPoint => {
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
export const moveByVector = (from: XYPInex, to: XYPInex, length: number): XYPoint => {
  // why i wrote j_max + 1? thats for last gradient area -- otherwise it will be just a single dot
  return { x: from.x + (to.x - from.x) * length, y: from.y + (to.y - from.y) * length }
}


export const convexPolygonCentroid = (points: Array<XYPInex>): XYPoint => {
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
export const convexPolygonSquare = (points: Array<XYPInex>): number => {
  const p1 = points[0]
  let square = 0
  for (let i = 1; i < points.length - 1; i + 1) {
    const p2 = points[i]
    const p3 = points[i + 1]
    square += Math.abs((p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)) / 2
  }
  return square
}

export const distance = (p1: XYPInex, p2: XYPInex): number => {
  return Math.sqrt(quadDistance(p1, p2))
}

export const quadDistance = (p1: XYPInex, p2: XYPInex): number => {
  return ((p1.x - p2.x) ** 2) + ((p1.y - p2.y) ** 2)
}

export const compareDistance = (p1: XYPInex, p2: XYPInex, target: number): number => {
  return Math.sign((((p1.x - p2.x) ** 2) + ((p1.y - p2.y) ** 2)) - (target ** 2))
}

export const gaussFunction = (x: number, sigma: number, mu: number): number => {
  /* eslint-disable-next-line no-restricted-properties */
  return 1 / (sigma * Math.sqrt(2 * Math.PI)) * Math.pow(Math.E, -(Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2))))
}

/**
 * angle between three points where b is apex (middle point)
 */
export const angleBy3Points = (a: XYPInex, b: XYPInex, c: XYPInex): Radians => {
  const ab = { x: b.x - a.x, y: b.y - a.y }
  const cb = { x: b.x - c.x, y: b.y - c.y }
  const dot = (ab.x * cb.x + ab.y * cb.y) // dot product
  const cross = (ab.x * cb.y - ab.y * cb.x) // cross product
  const alpha = Math.atan2(cross, dot)
  return alpha
  // return (int) floor(alpha * 180. / pi + 0.5);
}

export const findNearestPoint = <T: XYPInex>(target: XYPInex, points: Array<T>): T => {
  if (points.length === 0) {
    throw ('empty points array')
  }
  const maped = R.map(p => [p, distance(p, target)])(points)
  return R.reduce(([aN, aD], [cN, cD]) => (cD < aD ? [cN, cD] : [aN, aD]), maped[0], maped)[0]
}

// take two points and find formula of line between them in (ax + by + c = 0) style
export const lineFormula = (p1: XYPInex, p2: XYPInex): LineFormula => {
  // (y1 - y2) * x + (x2 - x1) * y + (x1*y2 -x2*y1) = 0 ((ax + by + c = 0))
  const a = p1.y - p2.y
  const b = p2.x - p1.x
  const c = p1.x * p2.y - p2.x * p1.y
  // resulting line is the same. we do that for comparing formulae
  return (a >= 0) ? { a, b, c } : { a: -a, b: -b, c: -c }
}

// calculates two lines cross point lines taken by their a,b,c coef in (ax + by + c = 0) style
export const linesCrossPoint = (f1: LineFormula, f2: LineFormula): ?XYPoint => {
  const tmp = (f1.a * f2.b - f2.a * f1.b)
  // they are parallel
  if (tmp === 0) {
    return null
  }
  const x = -(f1.c * f2.b - f2.c * f1.b) / tmp
  const y = -(f1.a * f2.c - f2.a * f1.c) / tmp
  return { x, y }
}

export const intervalsCrossPoint = (a1: XYPInex, a2: XYPInex, b1: XYPInex, b2: XYPInex): ?XYPoint => {
  if (R.equals(a1, a2) || R.equals(b1, b2)) {
    throw new Error('a1 === a2 or b1 === b2 which is not allowed')
  }
  if (!isSquaresIntersect(a1, a2, b1, b2)) {
    return null
  }
  const c = linesCrossPoint(lineFormula(a1, a2), lineFormula(b1, b2))
  if (!c) {
    return null
  }
  if (between(c.x, a1.x, a2.x) && between(c.y, a1.y, a2.y) && between(c.x, b1.x, b2.x) && between(c.y, b1.y, b2.y)) {
    return c
  }
  return null
}

export const intervalsCrossPointNoEdge = (a1: XYPInex, a2: XYPInex, b1: XYPInex, b2: XYPInex): ?XYPoint => {
  if (R.equals(a1, b1) || R.equals(a1, b2) || R.equals(a2, b1) || R.equals(a2, b2)) {
    return null
  }
  return intervalsCrossPoint(a1, a2, b1, b2)
}

export const isSquaresIntersect = (a1: XYPInex, a2: XYPInex, b1: XYPInex, b2: XYPInex): boolean => {
  const [axmin, axmax] = minmax(a1.x, a2.x)
  const [aymin, aymax] = minmax(a1.y, a2.y)
  const [bxmin, bxmax] = minmax(b1.x, b2.x)
  const [bymin, bymax] = minmax(b1.y, b2.y)
  return (Math.min(axmax, bxmax) >= Math.max(axmin, bxmin)) && (Math.min(aymax, bymax) >= Math.max(aymin, bymin))
}

const between = (target: number, n1: number, n2: number): boolean => {
  const [min, max] = minmax(n1, n2)
  return (min <= target) && (target <= max)
}

const minmax = (n1: number, n2: number): [number, number] => (n1 > n2 ? [n2, n1] : [n1, n2])

// ////////////////////////////////////////
// graph
// ////////////////////////////////////////
type GraphEdgeId = string
type GraphEdge = {| id: GraphEdgeId, links: Array<GraphEdgeId> |}
type Graph<T: { ...GraphEdge }> = { [string]: T }
type EdgeIdsIndexed = {| [GraphEdgeId]: GraphEdgeId |}
type EdgeChains = Array<EdgeIdsIndexed>

/* both-sided links! */
export const findEdgesChains = <T: { ...GraphEdge }>(anchorEdges: Array<GraphEdgeId>, graph: Graph<T>): EdgeChains =>
  findEdgesChainsRec(anchorEdges, graph, R.indexBy(e => e, anchorEdges))

export const findEdgesChainsRec = <T: { ...GraphEdge }>(
  anchorEdges: Array<GraphEdgeId>,
  graph: Graph<T>,
  anchorEdgesOrig: EdgeIdsIndexed,
  edgeChains: EdgeChains = [],
  edgeChainsFlatten: EdgeIdsIndexed = {}
): EdgeChains => {
  if (R.equals(anchorEdges, [])) {
    return edgeChains
  }
  const [curEdge, ...restEdges] = anchorEdges
  const restAnchorEdges = R.omit([curEdge], anchorEdgesOrig)
  const sublist = findByLinks(curEdge, graph, e => !restAnchorEdges[e.id] && !edgeChainsFlatten[e.id])
  const newEdgeChainsFlatten = { ...edgeChainsFlatten, ...sublist }
  return findEdgesChainsRec(restEdges, graph, anchorEdgesOrig, [...edgeChains, sublist], newEdgeChainsFlatten)
}

/* both-sided links! */
export const findByLinks = <T: { ...GraphEdge }>(
  curEdges: Array<GraphEdgeId> | GraphEdgeId,
  graph: Graph<T>,
  filter: (GraphEdge) => boolean = () => true,
  closeList: EdgeIdsIndexed = {}
): EdgeIdsIndexed => {
  if (typeof curEdges === 'string') {
    return findByLinks([curEdges], graph, filter, closeList)
  }
  curEdges.forEach(id => {
    if (!graph[id]) {
      throw new Error(`id ${id} not found in graph`)
    }
  })
  const curEdgesFiltered = R.indexBy(e => e, R.filter(id => !closeList[id] && filter(graph[id]), curEdges))
  if (R.equals(curEdgesFiltered, {})) {
    return closeList
  }
  const newEdgesA = []
  /* eslint-disable-next-line array-callback-return */
  R.map(edge => {
    if (curEdgesFiltered[edge.id] !== undefined) {
      /* eslint-disable-next-line no-param-reassign */
      closeList[edge.id] = edge.id
      newEdgesA.push(edge.links)
    }
  }, graph)
  // $FlowIgnore
  const newEdges: Array<GraphEdgeId> = R.uniq(R.flatten(newEdgesA))
  // console.log('newEdges', JSON.stringify(newEdges, null, 2))
  // console.log('closeList', JSON.stringify(closeList, null, 2))
  return findByLinks(newEdges, graph, filter, closeList)
}

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
