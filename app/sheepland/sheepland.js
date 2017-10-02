import Util from "common/util";
import CreatureNames from "sheepland/creature_names";

class Sheepland {
  constructor() {
    this.creature_names = new CreatureNames();
  }

  test() {
    let count = 100;
    while (--count) {
      this.generate_creature(count);
    }
  }

  generate_creature(i) {
    let sex = Math.random() < 0.5 ? 'male' : 'female';
    let creature = {id: i, sex: sex, species: 'human'};
    this.creature_names.generate(creature);
    console.log("GE", sex, creature.name);
  }
}

let game = new Sheepland();
game.test();
module.exports.game = game;
