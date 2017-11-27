import * as UUID from "uuid";
import Util from "common/util";


/**
 *
 */
export default class DirectLink {

  constructor(relation_manager) {
    this.relation_manager = relation_manager;
    this.data = {};
    this.backlinks = {};
    this.from_links_limit = 1;
    this.to_links_limit = 1;
  }


  create(from, to) {
    let link = {id: UUID.v1(), from: from, to: to};
    this.data[link.id] = link; // wut???
    if (this.backlinks[from.id] && this.backlinks[from.id].length > this.from_links_limit) {
      throw('cannot add link, "from" links limit reached'); // throw? return false; ?
    }
    if (this.backlinks[to.id] && this.backlinks[to.id].length > this.to_links_limit) {
      throw('cannot add link, "to" links limit reached'); // throw? return false; ?
    }
    if (!)
    // ???
    Util.push_uniq(to.id, this.backlinks[from.id]);
    Util.push_uniq(from.id, this.backlinks[to.id]);
    return link;
  }




  init_from(client) {
    return this.init(client, this.from_exports());
  }

  init_to(client) {
    return this.init(client, this.to_exports());
  }

  init(client, exports) {
    //let exports = this.from_exports();
    for (let name in exports) {
      if (client[name]) {
        throw('cannot create exported method on client cause it already exists: '+name);
      }
      client[name] = exports[name].bind(this, client);
    }
  }


  delete(from, to) {
    // TODO
  }


  from_exports() {
    return {};
  }


  to_exports() {
    return {};
  }
}
