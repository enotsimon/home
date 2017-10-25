import Util from "common/util";
import Calendar from "sheepland/calendar";
import RelationManager from 'sheepland/relation_manager';
import Creature from "sheepland/creatures/creature";
import CreatureSpecies from "sheepland/creatures/creature_species";
import CreatureSex from "sheepland/creatures/creature_sex";
import CreatureNames from "sheepland/creatures/creature_names";
import LifeCycle from "sheepland/creatures/life_cycle";

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
    let relations_list = [CreatureSpecies, CreatureSex, CreatureNames, LifeCycle];
    let entities_list = [Creature];
    let links_list = [];
    this.rm = new RelationManager(relations_list, entities_list, links_list);
    
    this.calendar = new Calendar();

    this.test(); // TEMP

    this.tick();
  }


  test() {
    let count = 15;
    while (--count) {
      this.generate_creature("human");
    }
    count = 15;
    while (--count) {
      this.generate_creature("sheep");
    }
  }


  generate_creature(species, sex = false, birth_ts = false) {
    return this.rm.Creature.create({species, sex, birth_ts});
  }


  tick() {
    this.calendar.handle_tick();
    this.rm.LifeCycle.handle_tick();

    if (this.ticks % 10 == 0) {
      this.app.set_date(this.calendar.date.toUTCString());
    }
    if (this.ticks % 100 == 0) {
      let creature_list = Object.values(this.rm.Creature.data);
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
