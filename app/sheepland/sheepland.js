import Util from "common/util";
import Calendar from "sheepland/calendar";
import CreatureNames from "sheepland/creature_names";

import App from 'sheepland/components/app';
import ReactDOM from 'react-dom';
import React from 'react';

class Sheepland {
  constructor() {
    this.ticks = 0;
    this.tick_basic_delay = 10;
    this.tick_speed = 1;
    this.tick_handlers = [];
  }


  generate_world() {
    this.calendar = new Calendar();
    this.creature_names = new CreatureNames();
    //this.creature_age = new CreatureAge();

    this.tick();
  }


  test() {
    let count = 100;
    while (--count) {
      this.generate_creature(count);
    }
  }


  generate_creature(i) {
    let sex = Math.random() < 0.5 ? 'male' : 'female';
    let creature = {id: i, sex: sex, species: 'human'};
    this.creature_names.generate(creature);
    //console.log("GE", sex, creature.name);
  }


  tick() {
    this.calendar.handleTick();

    if (this.ticks % 10 == 0) {
      this.app.set_date(this.calendar.date.toUTCString());
    }

    this.ticks++;
    setTimeout(this.tick.bind(this), this.tick_basic_delay * this.tick_speed);
  }
}



let game = new Sheepland();
module.exports.game = game;

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App/>, document.querySelector('#app'));
  game.generate_world();
  game.test();
});
