import Util from "common/util";
import {game} from "planets/game";
import * as d3 from "d3";

export default class Interaction {
  constructor() {
    this.mode = 'initial';
  }

  init() {
    this.game = game;
    console.log('Interaction init ok');
  }

  init_actions_mode() {
    this.mode = 'actions';
  }
}
