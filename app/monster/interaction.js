import Util from "common/util";
import {game} from "planets/game";
import * as d3 from "d3";

export default class Interaction {
  constructor() {
    this.state = 'initial';
  }

  init() {
    this.game = game;
    console.log('Interaction init ok');
  }
}
