import Util from "common/util";

export default class Agent {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.stat = {};
  }

  add_symbol_class(prop, symbols, init_advance = 0) {
    this[prop] = [];
    this.stat[prop] = {counters: {}, valuables: [], exchange_flag: false};
    symbols.forEach(symbol => this.push_symbol(prop, symbol));
    this.calc_valuables(prop);
    while (init_advance-- > 0) this.advance_array(this[prop]);
  }

  advance_symbol_classes() {
    this.for_all_symbol_classes((symbols, prop) => this.advance_array(symbols));
  }

  are_you_gonna_exchange(prop) {
    return !this.is_valuable_symbol(this.get_current_symbol(prop), prop);
  }

  is_valuable_symbol(symbol, prop) {
    return this.stat[prop].valuables.indexOf(symbol) !== -1;
  }

  get_current_symbol(prop) {
    return Util.last(this[prop]);
  }

  //
  // private
  //
  for_all_symbol_classes(func) {
    // nasty hack
    for (let key in this) {
      if (this[key] instanceof Array) {
        func(this[key], key);
      }
    }
  }

  advance_array(symbol_class) {
    let first = symbol_class.shift();
    symbol_class.push(first);
  }

  do_something_with_symbol(prop, symbol, fun) {
    if (!this[prop] instanceof Array) {
      throw({msg: "bad symbol class", prop});
    }
    // omg!
    let length_was = this[prop].length;
    let ret = this[prop][fun](symbol);
    let diff = this[prop].length - length_was;
    this.stat[prop].counters[symbol] = this.stat[prop].counters[symbol] + diff || 1;
    if (this.stat[prop].counters[symbol] < 0) {
      throw({msg: "something wrong with stat", prop, stat: this.stat[prop]});
    }
    this.calc_valuables(prop);
    return ret;
  }

  push_symbol(prop, symbol) {
    this.do_something_with_symbol(prop, symbol, 'push');
  }

  pop_symbol(prop, symbol) {
    this.do_something_with_symbol(prop, symbol, 'pop');
  }

  calc_valuables(prop) {
    let stat = this.stat[prop].counters;
    let max_count = 0;
    // first try to value all symbols that has best stat and all that 1 point worse
    let valuables = Object.keys(stat).filter(symbol => stat[symbol] > Math.max(max_count - 1, 1));
    // then throw away all that 1 point worse
    if (valuables.length == stat.length) {
      console.log('valuables flush 1');
      valuables = Object.keys(stat).filter(symbol => stat[symbol] > Math.max(max_count, 1));
    }
    // then throw away all
    if (valuables.length == stat.length) {
      console.log('valuables flush 2');
      valuables = [];
    }
    this.stat[prop].valuables = valuables;
  }
}
