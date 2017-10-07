import Util from "common/util";
import {game} from "sheepland/sheepland";

/**
 *  REQUIRE: species, sex, birth_ts
 *  INJECT: fertile, life_cycle, life_duration
 */
export default class LifeCycle {
  constructor() {
    this.config = this.get_config();
  }

  // different
  get_config() {
    return {
      human: {
        life_duration: 75,
        adult_from: 15,
        old_from: 45,
        //female_fertile_till: 35,
      },
      sheep: {
        life_duration: 10,
        adult_from: 1,
        old_from: 6,
        //female_fertile_till: 6,
      },
    }
  }


  generate(creature, birth_ts = false) {
    if (!this.config[creature.species]) {
      console.log("unknown creature species", creature);
      throw('unknown creature species: '+creature.species);
    }
    if (!creature.birth_ts) {
      throw('no creature.birth_ts');
    }

    creature.birth_ts = this.calc_birth_ts(creature, birth_ts);
    creature.life_duration = this.calc_life_duration(creature);
    this.update_creature_status(creature);
  }

  life_duration_in_days(creature) {
    return Math.floor(creature.life_duration / (1000*60*60*24)); 
  }

  left_to_live_in_days(creature) {
    return Math.floor((creature.life_duration - Math.abs(game.calendar.current_ts() - creature.birth_ts)) / (1000*60*60*24)); 
  }


  
  // incorrect, but we dont care
  // slow, ineffective?
  get_age(creature) {
    let diff = Math.abs(creature.birth_ts - game.calendar.current_ts());
    let date = new Date();
    date.setTime(diff);
    return {years: date.getFullYear() - 1970, months: date.getUTCMonth() + 1, days: date.getUTCDate()};
  }




  ///////////////////////////////////////
  // private
  ///////////////////////////////////////
  calc_birth_ts(creature, birth_ts) {
    let max_random_age = 1000*60*60*24*365*Math.ceil(this.config[creature.species].life_duration / 2);
    if (birth_ts && birth_ts > game.calendar.current_ts()) {
      console.log('creature birth_ts greater than current ts', birth_ts, game.calendar.current_ts());
      return false;
    }
    if (!birth_ts) {
      birth_ts = game.calendar.current_ts() - Util.rand(0, max_random_age);
    }
    return birth_ts;
  }


  calc_life_duration(creature) {
    let basic_duration = this.config[creature.species].life_duration;
    let diff = Math.round(basic_duration/3);
    let cur_life_duration = Math.abs(game.calendar.current_ts() - creature.birth_ts);
    let years_lived = game.creature_age.get_age(creature).years;
    // in ticks
    let life_duration = cur_life_duration + Util.rand(0, (basic_duration + diff - years_lived)*1000*60*60*24*365);
    return life_duration;
  }



  handle_tick() {
    // TODO maybe not every tick?
    game.creatures.forEach(creature => this.update_creature_status(creature));
  }


  update_creature_status(creature) {
    creature.life_cycle = this.calc_life_cycle(creature);
    creature.fertile = this.calc_fertility(creature);
  }


  calc_life_cycle(creature) {
    let spec = this.config[creature.species];
    let creature_age = game.creature_age.get_age(creature).years;
    if (game.calendar.current_ts() > creature.birth_ts + creature.life_duration) {
      return 'dead';
    } else if (creature_age < spec.adult_from) {
      return 'child';
    } else if (creature_age < spec.old_from) {
      return 'adult';
    } else {
      return 'old';
    }
  }

  calc_fertility(creature) {
    if (creature.sex == 'male') {
      return creature.life_cycle == 'adult' || creature.life_cycle == 'old';
    } else if (creature.sex == 'female') {
      return creature.life_cycle == 'adult';
    } else {
      console.log("bad sex for calc_fertility", creature);
      throw('bad sex for calc_fertility: '+creature.sex);
    }
  }
}