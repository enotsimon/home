/**
 * DEPRECATED!!!
 */

export default class Util {
  static exec_in_cycle_with_delay(index, limit, delay, func, final_func = function () {}) {
    if ((typeof limit === 'function' && !limit()) || (index >= limit)) {
      final_func(index)
      return
    }
    func(index)
    setTimeout(() => { Util.exec_in_cycle_with_delay(index + 1, limit, delay, func, final_func) }, delay)
  }

  static rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  static rand_element(arr) {
    if (arr.length == 0) return false
    return arr[Util.rand(0, arr.length - 1)]
  }

  static rand_float(min, max) {
    return Math.random() * (max - min) + min
  }


  static normalize_value(value, max, normal_max, min = 0, normal_min = 0) {
    if (value > max || value < min) {
      console.log('value out of range', value, max, normal_max, min, normal_min)
      throw ('value out of range')
    }
    return (value - min) * (normal_max - normal_min) / (max - min) + normal_min
  }


  // /////////////////////////////////
  // ARRAYS
  // /////////////////////////////////
  static last(array) {
    return array.length == 0 ? false : array[array.length - 1]
  }

  static push_uniq(element, arr) {
    if (arr.indexOf(element) == -1) {
      arr.push(element)
    }
  }

  static merge(arr1, arr2) {
    arr2.forEach(e => Util.push_uniq(e, arr1))
  }

  static remove_element(element, arr) {
    const index = arr.indexOf(element)
    if (index !== -1) {
      arr.splice(index, 1)
      return true
    }
    return false
  }

  static for_all_consecutive_pairs(array, fun) {
    if (array.length < 2) {
      return false
    }
    for (let i = 0; i < array.length; i++) {
      const cur = array[i]
      const next_index = (i + 1 == array.length) ? 0 : i + 1
      const next = array[next_index]
      fun(cur, next, i, next_index)
    }
  }

  static find_min_and_max(array, value_func) {
    if (!array.length) return false
    const ret = { min: null, max: null, min_element: null, max_element: null }
    array.forEach(e => {
      const res = value_func(e)
      if (isNaN(res) || res === null) return
      if (ret.min == null || ret.max == null) {
        ret.min = res
        ret.max = res
        ret.min_element = e
        ret.max_element = e
        return
      }
      if (res < ret.min) {
        ret.min = res
        ret.min_element = e
      }
      if (res > ret.max) {
        ret.max = res
        ret.max_element = e
      }
    })
    return ret
  }

  // ??? experimental. some standard routine for cyclic open_list processing
  static do_while_not_empty(open_list, func) {
    let length_before; let
      step = 0
    do {
      length_before = open_list.length
      open_list = open_list.filter(element => !func(element, step++))
      if (length_before == open_list.length) {
        console.log('do_while_not_empty() open_list length not chenged, bailing out', length_before, open_list)
        return false
      }
    } while (open_list.length)
    return true
  }

  // ////////////////////////////////////////
  // geometry
  // ////////////////////////////////////////
  static to_polar_coords(x, y) {
    const radius = Math.sqrt(x * x + y * y)
    const angle = Math.atan2(y, x)
    return { angle, radius }
  }

  static from_polar_coords(angle, radius) {
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    return { x, y }
  }

  static radians(degrees) { return degrees * Math.PI / 180 }

  static degrees(radians) { return radians * 180 / Math.PI }

  static angles_diff(a, b) {
    const diff = Math.abs(a - b)
    return Math.min(diff, 2 * Math.PI - diff)
  }

  static move_by_vector(from, to, length) {
    // why i wrote j_max + 1? thats for last gradient area -- otherwise it will be just a single dot
    return { x: from.x + (to.x - from.x) * length, y: from.y + (to.y - from.y) * length }
  }


  static convex_polygon_centroid(points) {
    const p1 = points[0]
    let square_sum = 0
    let xc = 0; let
      yc = 0
    for (let i = 1; i < points.length - 1; i++) {
      const p2 = points[i]
      const p3 = points[i + 1]
      const square = ((p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)) / 2 // triangle square
      square_sum += square
      xc += square * (p1.x + p2.x + p3.x) / 3
      yc += square * (p1.y + p2.y + p3.y) / 3
    }
    return { x: xc / square_sum, y: yc / square_sum }
  }

  // points should be sorted by angle to center!!!
  static convex_polygon_square(points) {
    const p1 = points[0]
    let square = 0
    for (let i = 1; i < points.length - 1; i++) {
      const p2 = points[i]
      const p3 = points[i + 1]
      square += Math.abs((p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)) / 2
    }
    return square
  }

  static distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  }

  static gauss_function(x, sigma, mu) {
    return 1 / (sigma * Math.sqrt(2 * Math.PI)) * Math.pow(Math.E, -(Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2))))
  }
}
