import * as UUID from "uuid";

/**
 *
 */
export default class Entity {

  constructor(relation_manager) {
    this.relation_manager = relation_manager;
    this.entities = {};
  }

  create() {
    let entity = {id: UUID.v1()};
    this.relations().forEach(relation => {
      let relation_instance = this.relation_manager[relation];
      relation_instance.create(entity);
    });
    this.entities[entity.id] = entity; // wut???
    return entity;
  }

  delete() {
    // TODO
  }

  // strings -- class names
  relations() {
    return [];
  }
}