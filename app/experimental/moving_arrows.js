
import Util from "common/util";
import Color from "common/color";
import * as d3 from "d3";
import BasicDrawer from "experimental/basic_drawer";

export default class MovingArrows extends BasicDrawer {
  constructor() {
    super('square');
    this.generate();
  }

  generate() {
    this.step = this.size / 10 | 0;
    this.matrix_size = this.size/2 | 0; // TEMP
    for (let y = 0; y < this.matrix_size; y += this.step) {
      for (let x = 0; x < this.matrix_size; x += this.step) {
        
      }
    }
  }


  redraw() {
    
  }
}

let app = new MovingArrows();
