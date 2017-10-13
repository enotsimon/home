import React from 'react';

import {game} from "sheepland/sheepland";


export default class CreaturesList extends React.Component {
  
  render() {
    return (
      <div>
        {this.props.creatures.map(creature => {
          let age = creature.age();
          return (<div key={creature.id}>
              <span>{creature.name()}</span>&nbsp;
              <span>({creature.species} {creature.sex})</span>&nbsp;
              <span>age: {age.years} years, {age.months} months, {age.days} days</span>&nbsp;
              <span>({creature.life_cycle()})</span>&nbsp;
              <span>fertile: {creature.fertile() ? 'yes' : 'no'}</span>&nbsp;
              <span>
                life duration: {creature.life_duration_in_days()} days
                ({creature.left_to_live_in_days()} days left)
              </span>&nbsp;
            </div>);
        })}
      </div>
    );
  }
}
