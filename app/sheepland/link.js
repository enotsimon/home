import * as UUID from "uuid";
import Util from "common/util";


/**
 *
 */
export default class Link {

  constructor(relation_manager) {
    this.relation_manager = relation_manager;
    this.data = {};
    this.backlinks = {};
  }


  create(from, to) {
    let link = {id: UUID.v1(), from: from, to: to};
    this.data[link.id] = link; // wut???
    // TODO: add exports? what about link exports on entity create?
    // ???
    Util.push_uniq(to.id, this.backlinks[from.id]);
    Util.push_uniq(from.id, this.backlinks[to.id]);
    return link;
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
