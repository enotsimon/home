import Util from "common/util";

import Relation from 'sheepland/relation';

/**
 *
 */
export default class TestRelation2 extends Relation {

  deps() {
    return ['TestRelation1'];
  }

  exports() {
    return {
      test_val_2: this.test_val_2,
    };
  }


  init(client) {
    this.data[client.id] = {test_val_2: Util.rand(1, 10)};
  }



  test_val_2(registry) {
    return registry.data[this.id].test_val_2;
  }
}