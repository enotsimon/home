import Util from "common/util";
import Calendar from "sheepland/calendar";
import Creature from "sheepland/creatures/creature";
import CreatureNames from "sheepland/creatures/creature_names";
import LifeCycle from "sheepland/creatures/life_cycle";

import App from 'sheepland/components/app';
import ReactDOM from 'react-dom';
import React from 'react';

import TestRelation1 from 'sheepland/test_relation_1';
import TestRelation2 from 'sheepland/test_relation_2';
import RelationManager from 'sheepland/relation_manager';
import TestEntity from 'sheepland/test_entity';


class Sheepland {
  constructor() {
    this.ticks = 0;
    this.tick_basic_delay = 10;
    this.tick_speed = 1;
    this.tick_handlers = [];
  }


  generate_world() {
    let relations_list = [TestRelation1, TestRelation2];
    this.relations = new RelationManager(relations_list);
    this.test_entities = new TestEntity(this.relations);
    
    this.creatures = []; // TEMP
    this.calendar = new Calendar();
    this.creature_names = new CreatureNames();
    this.life_cycle = new LifeCycle();

    this.test(); // TEMP

    this.tick();
  }


  test() {
    let count = 15;
    while (--count) {
      let creature = this.generate_creature("human");
      this.creatures.push(creature);
    }
    count = 15;
    while (--count) {
      let creature = this.generate_creature("sheep");
      this.creatures.push(creature);
    }
  }


  generate_creature(species, sex = false, birth_ts = false) {
    let creature = new Creature(species, sex);
    this.creature_names.generate(creature);
    this.life_cycle.generate(creature);

    let test_entity = this.test_entities.create();
    console.log('test_relation', test_entity.test_val(), test_entity.test_val_2());

    return creature;
  }


  tick() {
    this.calendar.handle_tick();
    this.life_cycle.handle_tick();

    if (this.ticks % 10 == 0) {
      this.app.set_date(this.calendar.date.toUTCString());
    }
    if (this.ticks % 100 == 0) {
      let creature_list = this.creatures.map(creature => {
        let copy = Object.assign({}, creature);
        copy.age = game.life_cycle.get_age(creature);
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
