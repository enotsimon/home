
/**
 *
 */
export default class RelationManager {
  // TODO add entities list?
  constructor(relations_list, entities_list, links_list) {
    relations_list.forEach(this.create_relation.bind(this));
    entities_list.forEach(this.create_entity.bind(this));
    links_list.forEach(this.create_link.bind(this));
  }

  // in root?
  create_relation(class_name) {
    this[class_name.name] = new class_name(this);
  }

  // in root?
  create_entity(class_name) {
    this[class_name.name] = new class_name(this);
  }

  // in root?
  create_link(class_name) {
    this[class_name.name] = new class_name(this);
  }
}