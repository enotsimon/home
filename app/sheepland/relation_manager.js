
/**
 *
 */
export default class RelationManager {
  constructor(relations_list) {
    relations_list.forEach(this.create_relation.bind(this));
  }

  // in root?
  create_relation(relation_class) {
    //this.relations[relation_class.name] = new relation_class(this);
    this[relation_class.name] = new relation_class(this);
  }
}