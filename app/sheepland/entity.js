import * as UUID from "uuid";

/**
 *
 */
export default class Entity {

  constructor(relation_manager) {
    this.relation_manager = relation_manager;
    this.id = UUID.v1();
  }

  init() {
    this.relations().forEach(relation => {
      let relation_instance = this.relation_manager[relation];
      relation_instance.generate(this);
    });
  }

  // strings -- class names
  relations() {
    return [];
  }
}