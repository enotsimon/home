import Util from "common/util";
import {game} from "sheepland/sheepland";


export default class Calendar {
  constructor() {
    this.game = game;
    console.log('DA', game);
    this.ticks_per_day = 1000/game.tick_basic_delay*60*5; // day lasts 5 min
    this.basic_time_ratio = 1000*60*60*24/this.ticks_per_day;

    this.date = new Date(-1346, 10, 4, 12, 5, 1, 0); // just for fun
  }


  handleTick() {
    this.date.setTime(this.date.getTime() + this.basic_time_ratio * game.tick_speed);
  }
}
