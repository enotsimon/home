import Relation from 'sheepland/relation';

/**
 *
 */
export default class CreatureSpecies extends Relation {

  exports() {
    return {
      species: (creature) => this.get_key(creature, 'species'),
    };
  }


  // strings -- class names
  deps() {
    return [];
  }


  create(creature, props) {
    super.create(creature, props);
    this.set_key(creature, 'species', props.species);
  }


  allowed_species() {
    return ['human', 'sheep'];
  }
}