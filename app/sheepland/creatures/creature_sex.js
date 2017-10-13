import Relation from 'sheepland/relation';

/**
 *
 */
export default class CreatureSex extends Relation {

  exports() {
    return {
      sex: (creature) => this.get_key(creature, 'sex'),
    };
  }


  // strings -- class names
  deps() {
    return [];
  }


  create(creature, props) {
    super.create(creature, props);
    if (!props.sex) {
      props.sex = Math.random() < 0.5 ? 'male' : 'female';
    }
    this.set_key(creature, 'sex', props.sex);
  }


  allowed_sex() {
    return ['male', 'female'];
  }
}