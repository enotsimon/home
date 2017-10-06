import Util from "common/util";
import Calendar from "sheepland/calendar";
import Creature from "sheepland/creatures/creature";
import CreatureNames from "sheepland/creatures/creature_names";
import CreatureAge from "sheepland/creatures/creature_age";

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
    this.creatures = []; // TEMP
    this.calendar = new Calendar();
    this.creature_names = new CreatureNames();
    this.creature_age = new CreatureAge();

    this.test(); // TEMP

    this.tick();
  }


  test() {
    let count = 15;
    while (--count) {
      let creature = this.generate_creature(count);
      this.creatures.push(creature);
    }
  }


  generate_creature(i, sex = false, age = false) {
    let creature = new Creature("human", sex);
    this.creature_names.generate(creature);
    this.creature_age.generate(creature);
    //console.log("GE", sex, creature.name);
    return creature;
  }


  tick() {
    this.calendar.handle_tick();

    if (this.ticks % 10 == 0) {
      this.app.set_date(this.calendar.date.toUTCString());
    }
    if (this.ticks % 100 == 0) {
      let creature_list = this.creatures.map(creature => {
        let copy = Object.assign({}, creature);
        copy.age = game.creature_age.get_age(creature);
        return copy;
      });
      this.app.set_creatures_list(creature_list);
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
});
