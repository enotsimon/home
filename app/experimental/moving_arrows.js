
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
    console.log('call MovingArrows generate');
  }


  redraw() {
    
  }
}

let app = new MovingArrows();
