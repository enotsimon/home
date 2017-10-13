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
      test_val: (client) => this.get_key(client, 'test_val'),
    };
  }


  create(client) {
    super.create(client);
    this.data[client.id].test_val = Util.rand(1, 10);
  }
}
