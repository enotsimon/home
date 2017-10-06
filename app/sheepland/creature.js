import Util from "common/util";
import {game} from "sheepland/sheepland";
import * as UUID from "uuid";

/**
 *  species, sex -- should move from here
 */
export default class Creature {
  constructor(species, sex = false) {
    if (!sex) {
      sex = Math.random() < 0.5 ? 'male' : 'female';
    }
    this.id = UUID.v1();
    this.species = species;
    this.sex = sex;
  }

  allowed_sex() {
    return ['male', 'female'];
  }

  allowed_species() {
    return ['human', 'sheep'];
  }
}