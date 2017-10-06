import Util from "common/util";
import {game} from "sheepland/sheepland";

/**
 *  REQUIRE: species, sex
 *  INJECT: fertile, life_cycle
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


  generate(creature) {
    if (!this.config[creature.species]) {
      console.log("unknown creature species", creature);
      throw('unknown creature species: '+creature.species);
    }
    this.update_creature_status(creature);
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
    if (creature_age < spec.adult_from) {
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