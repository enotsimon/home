import CollapsiblePanel from 'common/components/collapsible_panel';
import CreaturesList from 'sheepland/components/creatures_list';
import React from 'react';

import {game} from "sheepland/sheepland";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {date: ''};
    // !!! im shure its not good way, but i dont know better...
    game.app = this;
  }

  set_date(date) {
    let new_state = Object.assign({}, this.state);
    new_state.date = date;
    this.setState(new_state);
  }



  render() {
    return (
      <table style={{margin: '5px', borderSpacing: '5px', borderCollapse: 'separate'}}>
      <tbody>
        <tr style={{verticalAlign: 'top'}}>
          <td>
            <div className="panel-group">

              <div className="panel panel-success">
                <div className="panel-heading">
                  <h4 className="panel-title">
                    date
                  </h4>
                </div>
                <div className="panel-body">
                  {this.state.date}
                </div>
              </div>

              <div className="panel panel-success">
                <div className="panel-heading">
                  <h4 className="panel-title">
                    creatures list
                  </h4>
                </div>
                <div className="panel-body">
                  <CreaturesList />
                </div>
              </div>

            </div>
          </td>
        </tr>
      </tbody>
      </table>
    );
  }
}
