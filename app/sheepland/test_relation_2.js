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
      test_val_2: (client) => this.get_key(client, 'test_val_2'),
    };
  }


  create(client) {
    super.create(client);
    this.data[client.id].test_val_2 = Util.rand(1, 10);
  }
}