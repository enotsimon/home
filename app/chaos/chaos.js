import ReactDOM from 'react-dom';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import Util from "common/util";
import Agent from 'chaos/agent';

import App from './components/app';
import root_reducer from './reducers';
import * as actions from './actions';

class Chaos {
  constructor() {
    // constants
    this.x_size = 20;
    this.y_size = 20;
    this.symbols = ['✕', '✖', '✙', '✚', '✛', '✜', '✠', '✡', '✢', '✣', '✤', '✥', '✦', '✧', '✩', '✪', '✫', '✬', '✭', '✮', '✯', '✰', '✱', '✲', '✳', '✴', '✵', '✶', '✷', '✸', '✹', '✺', '✻', '✽', '✾', '✿', '❀', '❁', '❂', '❃', '❄', '❅', '❆', '❇', '❈', '❉', '❊', '❋', '❖'];
    this.symbol_min_weight = 8;
    this.symbol_max_weight = 16;
    this.symbol_classes_min_length = 15;
    this.symbol_classes_max_length = 20;
    this.symbol_classes_count = 2;

    this.init();
  }

  init() {
    let symbols_arr = [];
    this.symbols.forEach(symbol => {
      let symbol_weight = Util.rand(this.symbol_min_weight, this.symbol_max_weight);
      symbols_arr = symbols_arr.concat((new Array(symbol_weight)).fill(symbol));
    });

    this.symbol_classes = Array.from(Array(this.symbol_classes_count), e => {
      let length = Util.rand(this.symbol_classes_min_length, this.symbol_classes_max_length);
      // should symbol classes contain only uniq elements or not?
      return Array.from(Array(length), ee => Util.rand_element(this.symbols));
    });

    this.data = Array.from(Array(this.y_size).keys(), y => {
      return Array.from(Array(this.x_size).keys(), x => {
        return this.init_agent(x, y);
      });
    });
    this.store = createStore(root_reducer);
    this.tick_delay = 2000;
  }

  run(count) {
    if (count < 0) {
      return;
    }
    this.advance_symbol_classes();
    this.exchange_symbols();
    this.store.dispatch(actions.tick());
    setTimeout(() => this.run(--count), this.tick_delay);
  }

  //
  // private
  //

  init_agent(x, y) {
    let agent = new Agent(x, y);
    this.symbol_classes.forEach((symbol_class, i) => {
      agent.add_symbol_class('sc' + i, symbol_class, Util.rand(0, symbol_class.length));
    });
    return agent;
  }


  for_all_agents(func) {
    this.data.forEach(line => {
      line.forEach(agent => {
        func(agent);
      });
    });
  }

  advance_symbol_classes() {
    this.for_all_agents(agent => agent.advance_symbol_classes());
    this.store.dispatch(actions.advance_symbols_complete());
  }

  get_neighbors(agent) {
    // von neimann
    let base = [[agent.x - 1, agent.y], [agent.x + 1, agent.y], [agent.x, agent.y - 1], [agent.x, agent.y + 1]];
    let ret = [];
    base.forEach(([x, y]) => {
      if (this.data[y] && this.data[y][x]) {
        ret.push(this.data[y][x]);
      }
    });
    return ret;
  }

  //
  // hellish omg part
  //
  exchange_symbols() {
    this.for_all_agents(agent => {
      agent.for_all_symbol_classes((symbols, prop) => {
        let neighbors = this.get_neighbors(agent);
        let valuable_neighbors = neighbors.filter(a => agent.is_valuable_symbol(a.get_current_symbol(prop), prop));
        if (valuable_neighbors.length) {
          console.log('valuable_neighbors OK', valuable_neighbors.length);
        }
        let ready_neighbors = valuable_neighbors.filter(a => a.are_you_gonna_exchange(prop));
        if (ready_neighbors.length) {
          console.log('ready_neighbors OK', prop, agent.x, agent.y);
        } else {
          console.log('ready_neighbors EMPTY', prop, agent.x, agent.y);
        }
      });
    });
  }
}


const chaos = new Chaos();
export default chaos;
chaos.run(5);

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Provider store={chaos.store}>
      <App />
    </Provider>,
    document.querySelector('#app')
  );
});
