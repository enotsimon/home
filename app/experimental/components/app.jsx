import CollapsiblePanel from 'common/components/collapsible_panel';
import DebugInfo from 'experimental/components/debug_info';
import GenerateWorldForm from 'experimental/components/generate_world_form';
import React from 'react';

export default class App extends React.Component {
  render() {
    return (
      <table style={{margin: '5px', borderSpacing: '5px', borderCollapse: 'separate'}}>
      <tbody>
        <tr style={{verticalAlign: 'top'}}>
          <td>

            <div className="panel-group">
              <div className="panel panel-success">
                <div className="panel-body">
                  <div className="" id="map_container">
                    <canvas id='map' width='600' height='600'></canvas>
                  </div>
                </div>
              </div>
              <CollapsiblePanel header="debug" name="debug" content_func={() => React.createElement(DebugInfo)} />
            </div>

          </td>
          <td width="100%">

            <div className="panel-group">
              <div className="panel panel-success">
                <div className="panel-body">
                  <CollapsiblePanel header="world generating" name="generate_world" content_func={() => React.createElement(GenerateWorldForm)} />
                </div>
                <div className="panel-footer">
                  
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
