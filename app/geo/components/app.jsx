import React from 'react';
import CollapsiblePanel from 'common/components/collapsible_panel';
import DebugInfo from 'geo/components/debug_info';
import GenerateWorldForm from 'geo/components/generate_world_form';
import DrawingSettingsForm from 'geo/components/drawing_settings_form';
import RoadsForm from 'geo/components/roads_form';
import Legend from 'geo/components/legend';

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
                    <canvas id='map' width='800' height='800'></canvas>
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
                  
                  <CollapsiblePanel header="drawing settings" name="drawing_settings" content_func={() => React.createElement(DrawingSettingsForm)} />

                  <CollapsiblePanel header="roads" name="roads" content_func={() => React.createElement(RoadsForm)} />

                </div>
                <div className="panel-footer">
                  <CollapsiblePanel header="legend" name="legend" content_func={() => React.createElement(Legend)} />
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
