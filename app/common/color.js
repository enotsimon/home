import Util from "common/util";

export default class Color {

  static random_near([r, g, b], step = 10, count = 2) {
    return Color.for_rgb([r, g, b], e => Color.random_channel(e, step, count));
  }

  static random([r, g, b], step = 10) {
    return Color.for_rgb([r, g, b], e => Color.random_by_floor(e, step));
  }


  static to_pixi([r, g, b]) {
    return (r << 16) + (g << 8) + b;
  }

  // PRIVATE
  static for_rgb([r, g, b], func) {
    return [func(r), func(g), func(b)];
  }

  // PRIVATE
  static random_channel(base, step, count) {
    let rand = step*Util.rand(-count, count);
    let res = base + rand;
    return res > 255 ? 255 : res < 0 ? 0 : res;
  }

  // PRIVATE
  static random_by_floor(floor, step) {
    return floor - step*Util.rand(0, floor/step | 0);
  }
}