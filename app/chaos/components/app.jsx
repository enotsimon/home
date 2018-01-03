
import React from 'react';
import GridContainer from './grid_container';

export default class App extends React.Component {
  render() {
    return (
      <div className="panel-group">

        <div className="panel panel-success">
          <div className="panel-body">
            <div className="" id="view_container">
              <GridContainer />
            </div>
          </div>
        </div>

      </div>
    );
  }
}
