import React from 'react';

import {game} from "sheepland/sheepland";


export default class CreaturesList extends React.Component {
  
  render() {
    return (
      <div>
        {this.props.creatures.map(creature => {
          //console.log('DPO', creature);
          return (<div key={creature.id}>
              <span>{creature.name}</span>&nbsp;
              <span>({creature.species} {creature.sex})</span>&nbsp;
              <span>age: {creature.age.years} years, {creature.age.months} months, {creature.age.days} days</span>
            </div>);
        })}
      </div>
    );
  }
}
