import Util from "common/util";
import Entity from 'sheepland/entity';

/**
 *  TODO species, sex -- should move from here
 */
export default class Creature extends Entity {
  relations() {
    return ['CreatureSpecies', 'CreatureSex', 'CreatureNames', 'LifeCycle'];
  }
}