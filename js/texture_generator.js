import Util from "js/util";
import MapDrawer from "js/map_drawer";

export default class TextureGenerator {

  simple(base) {
    let step = 10;
    let lower = [this.color_channel(base[0], -step), this.color_channel(base[1], -step), this.color_channel(base[2], -step)];
    let upper = [this.color_channel(base[0], step), this.color_channel(base[1], step), this.color_channel(base[2], step)];
    return this.generate(lower, upper, step, 400, 2);
  }

  color_channel(base, step) {
    if (base == 0) {
      return 0;
    }
    let res = base + step;
    if (res < 0 || res > 255) {
      throw('color channel out of border');
    }
    return res;
  }

  generate(lower, upper, step, tiles_count, tile_size) {
    let graphics = new PIXI.Graphics();
    for (let y = 0; y < tiles_count; y++) {
      for (let x = 0; x < tiles_count; x++) {
        graphics.beginFill(MapDrawer.color(this.random_color(lower, upper, step)));
        graphics.drawRect(tile_size*x, tile_size*y, tile_size, tile_size);
        graphics.endFill();
      }
    }
    let texture = graphics.generateCanvasTexture(PIXI.SCALE_MODES.NEAREST, 1);
    return texture;
  }




  random_color(lower, upper, step = 1) {
    return [this.rand(lower[0], upper[0], step), this.rand(lower[1], upper[1], step), this.rand(lower[2], upper[2], step)];
  }

  rand(lower, upper, step = 1) {
    return step*Util.rand(lower/step | 0, upper/step | 0);
  }
}