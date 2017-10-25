

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

  // TODO what to do with props?
  create(client, props) {
    if (!client.id) {
      console.log('no client id', client);
      throw('no client id');
    }

    this.deps().forEach(dep_class => {
      let instance = this.relation_manager[dep_class];
      for (let name in instance.exports()) {
        if (!client[name] || typeof client[name] !== "function") {
          console.log('dependency method does not present or its not a function', name, dep_class, client);
          throw('dependency method does not present  or its not a function');
        }
      }
    });
    let exports = this.exports();
    for (let name in exports) {
      if (client[name]) {
        throw('cannot create exported method on client cause it already exists: '+name);
      }
      client[name] = exports[name].bind(this, client);
    }
    this.data[client.id] = {};
  }
  

  get_key(client, key) {
    return this.data[client.id][key];
  }


  set_key(client, key, value) {
    this.data[client.id][key] = value;
  }


  delete() {
    // TODO
  }
}