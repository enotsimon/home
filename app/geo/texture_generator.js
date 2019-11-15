import Util from 'common/util'
import * as Color from 'common/color'

export default class TextureGenerator {
  simple(base) {
    return this.generate(base, 400, 2)
  }

  generate(base, tiles_count, tile_size) {
    const graphics = new PIXI.Graphics()
    for (let y = 0; y < tiles_count; y++) {
      for (let x = 0; x < tiles_count; x++) {
        graphics.beginFill(Color.to_pixi(Color.random_near(base)))
        graphics.drawRect(tile_size * x, tile_size * y, tile_size, tile_size)
        graphics.endFill()
      }
    }
    const texture = graphics.generateCanvasTexture(PIXI.SCALE_MODES.NEAREST, 1)
    return texture
  }
}
