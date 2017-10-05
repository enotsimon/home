import CollapsiblePanel from 'common/components/collapsible_panel';
import React from 'react';

export default class CreaturesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {creatures: []};
  }

  render() {
    return (
      <div>
        {this.state.creatures.forEach(creature => {
          <div id={creature.id}>da creature</div>
        })}
      </div>
    );
  }
}
