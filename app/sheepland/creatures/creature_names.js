import Util from "common/util";
import {game} from "sheepland/sheepland";
import Relation from 'sheepland/relation';


/**
 *  its like relation that requires some other relations + injects some
 */
export default class CreatureNames extends Relation {
  constructor(relation_manager) {
    super(relation_manager);

    this.names = {};
    this.named_species = ['human'];
    this.strategy = 'random';
    this.init_names_stat(require('sheepland/creatures/names/male_names').list, 'human', 'male');
    this.init_names_stat(require('sheepland/creatures/names/female_names').list, 'human', 'female');
  }

  init_names_stat(list, species, sex) {
    list.forEach(name => {
      this.init_name_stat(name);
      Util.push_uniq(species, this.names[name].species);
      Util.push_uniq(sex, this.names[name].sex);
    });
  }

  init_name_stat(name) {
    if (!this.names[name]) {
      this.names[name] = {species: [], sex: [], creatures: []};
      return true;
    }
    return false;
  }

  filter_names(func) {
    let ret = {};
    for (let i in this.names) {
      if (func(this.names[i])) {
        ret[i] = this.names[i];
      }
    }
    return ret;
  }



  //////////////////////////////////////////////////////////
  // public
  //////////////////////////////////////////////////////////
  create(creature) {
    super.create(creature);
    // animals have their species as name
    if (this.named_species.indexOf(creature.species()) == -1) {
      this.set_name(creature, creature.species());
      return;
    }
    let filtered = {};
    if (this.strategy == 'random') {
      filtered = this.filter_names(name => name.species.indexOf(creature.species()) != -1 && name.sex.indexOf(creature.sex()) != -1);
    } else if (this.strategy == 'evenly') {
      filtered = this.filter_names(name => name.species.indexOf(creature.species()) != -1 && name.sex.indexOf(creature.sex()) != -1);
      let min = Util.find_min_and_max(filtered, name => name.creatures.length).min;
      filtered = this.filter_names(name => name.creatures.length == min);
    } else {
      throw('unknown names strategy: '+this.strategy);
    }
    filtered = Object.keys(filtered);
    if (!filtered.length) {
      throw('dunno wly, but no names for choose, bad species?');
    }
    let name = Util.rand_element(filtered);
    this.set_name(creature, name);
  }

  deps() {
    return ['CreatureSpecies', 'CreatureSex'];
  }

  exports() {
    return {
      name: () => this.get_key('name'),
    };
  }




  set_name(creature, name) {
    this.init_name_stat(name);
    Util.push_uniq(creature.id, this.names[name].creatures);
    this.set_key(creature, 'name', name);
  }


  clear_name(creature) {
    if (!creature.name()) {
      return false;
    }
    if (!this.names[creature.name()]) {
      if (creature.name() != creature.species()) {
        throw('creature has name, its not its species, and theres no name stat');
      }
      return false;
    }
    Util.remove_element(creature.id, this.names[creature.name()].creatures);
    this.set_key(creature, 'name', null);
    return true;
  }
}
