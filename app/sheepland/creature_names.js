import Util from "common/util";
import {game} from "sheepland/sheepland";

/**
 *  its like relation that requires some other relations + injects some
 *  REQUIRE: species, sex, id
 *  INJECT: name
 */
export default class CreatureNames {
  constructor() {
    this.names = {};
    this.named_species = ['human'];
    // ???
    this.required_props = ['species', 'sex', 'id'];
    this.strategy = 'random';

    this.init_names_stat(require('sheepland/names/male_names'), 'human', 'male');
    this.init_names_stat(require('sheepland/names/female_names'), 'human', 'female');
  }

  init_names_stat(list, species, gender) {
    list.forEach(name => {
      this.init_name_stat(name);
      Util.push_uniq(species, this.names[name].species);
      Util.push_uniq(gender, this.names[name].genders);
    });
  }

  init_name_stat(name) {
    if (!this.names[name]) {
      this.names[name] = {species: [], genders: [], creatures: []};
      return true;
    }
    return false;
  }

  creature_link(creature) {
    return creature.id;
  }



  generate(creature) {
    this.required_props.forEach(prop => {
      if (!creature[prop]) {
        throw("creature has no property "+prop);
      }
    });
    // animals have their species as name
    if (this.named_species.indexOf(creature.species) == -1) {
      creature.name = creature.species;
      return;
    }
    let filtered = [];
    if (this.strategy == 'random') {
      filtered = this.names.filter(name => name.species.indexOf(creature.species) != -1 && name.genders.indexOf(creature.gender) != -1);
    } else if (this.strategy == 'evenly') {
      filtered = this.names.filter(name => name.species.indexOf(creature.species) != -1 && name.genders.indexOf(creature.gender) != -1);
      let min = Util.find_min_and_max(filtered, name => name.creatures.length).min;
      filtered = filtered.filter(name => name.creatures.length == min);
    } else {
      throw('unknown names strategy: '+this.strategy);
    }
    if (!filtered) {
      throw('dunno wly, but no names for choose, bad species?');
    }
    let name = Util.rand_element(filtered);
    this.set_name(creature, name);
  }


  set_name(creature, name) {
    this.init_name_stat(name);
    Util.push_uniq(this.creature_link(creature), this.names[name].creatures);
  }


  clear_name(creature) {
    if (!creature.name) {
      return false;
    }
    if (!this.names[creature.name]) {
      if (creature.name != creature.species) {
        throw('creature has name, its not its species, and theres no name stat');
      }
      return false;
    }
    Util.remove_element(this.creature_link(creature), this.names[creature.name].creatures);
    return true;
  }
}
