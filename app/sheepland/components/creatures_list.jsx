import React from 'react';

import {game} from "sheepland/sheepland";


export default class CreaturesList extends React.Component {
  
  render() {
    return (
      <div>
        {this.props.creatures.map(creature => {
          return (<div key={creature.id}>
              <span>{creature.name}</span>&nbsp;
              <span>({creature.species} {creature.sex})</span>&nbsp;
              <span>age: {creature.age.years} years, {creature.age.months} months, {creature.age.days} days</span>&nbsp;
              <span>({creature.life_cycle})</span>&nbsp;
              <span>fertile: {creature.fertile ? 'yes' : 'no'}</span>&nbsp;
              <span>
                life duration: {game.life_cycle.life_duration_in_days(creature)} days
                ({game.life_cycle.left_to_live_in_days(creature)} days left)
              </span>&nbsp;
            </div>);
        })}
      </div>
    );
  }
}