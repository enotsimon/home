

/**
 *
 */
export default class Relation {

  constructor(relation_manager) {
    this.relation_manager = relation_manager;
    this.data = {};
  }


  exports() {
    return {};
  }


  // strings -- class names
  deps() {
    return [];
  }


  generate(client) {
    if (!client.id) {
      console.log('no client id', client);
      throw('no client id');
    }

    this.deps().forEach(dep_class => {
      let instance = this.relation_manager[dep_class];
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