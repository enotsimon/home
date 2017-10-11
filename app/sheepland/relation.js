import Util from "common/util";
import {game} from "sheepland/sheepland";

/**
 *
 */
export default class Relation {

  constructor() {
    this.data = {};
  }


  exports() {
    return {};
  }


  deps() {
    return [];
  }


  generate(client) {
    if (!client.id) {
      console.log('no client id', client);
      throw('no client id');
    }

    this.deps().forEach(dep_class => {
      let instance = new dep_class();
      for (let name in instance.exports()) {
        if (!client[name]) {
          console.log('dependency method does not present', name, dep);
          throw('dependency method does not present');
        }
      }
    });
    this.init(client);
    let exports = this.exports();
    for (let name in exports) {
      client[name] = exports[name].bind(client, this);
    }
  }
  

  init(client) {
  }
}