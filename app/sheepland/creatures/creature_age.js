import Util from "common/util";
import {game} from "sheepland/sheepland";

/**
 *  its like relation that requires some other relations + injects some
 *  REQUIRE: id
 *  INJECT: birth_ts
 */
export default class CreatureAge {
  constructor() {
    this.max_random_age = 1000*60*60*24*365*50; // 50 years
  }

  generate(creature, birth_ts = false) {
    if (birth_ts && birth_ts > game.calendar.current_ts()) {
      console.log('creature birth_ts greater than current ts', birth_ts, game.calendar.current_ts());
      return false;
    }
    if (!birth_ts) {
      birth_ts = game.calendar.current_ts() - Util.rand(0, this.max_random_age);
    }
    creature.birth_ts = birth_ts;
  }

  // incorrect, but we dont care
  // slow, ineffective?
  get_age(creature) {
    let diff = Math.abs(creature.birth_ts - game.calendar.current_ts());
    let date = new Date();
    date.setTime(diff);
    return {years: date.getFullYear() - 1970, months: date.getUTCMonth() + 1, days: date.getUTCDate()};
  }
}
