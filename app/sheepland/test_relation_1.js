import Util from "common/util";

import Relation from 'sheepland/relation';

/**
 *
 */
export default class TestRelation1 extends Relation {

  deps() {
    return [];
  }

  exports() {
    return {
      test_val: this.test_val,
    };
  }


  init(client) {
    this.data[client.id] = {test_val: Util.rand(1, 10)};
  }



  test_val(client) {
    return this.data[client.id].test_val;
  }
}
