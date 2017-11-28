
import Util from "common/util";
import Color from "common/color";
import {game} from "planets/game";

export default class Drawer {
  
  init(width, height) {
    this.game = game;
    console.log('Interaction init ok');
  }
}
