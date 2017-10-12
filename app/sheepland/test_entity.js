import Entity from 'sheepland/entity';

/**
 *
 */
export default class TestEntity extends Entity {

  // strings -- class names
  relations() {
    return ['TestRelation1', 'TestRelation2'];
  }
}