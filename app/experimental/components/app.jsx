
import DebugInfo from 'experimental/components/debug_info';
import React from 'react';

export default class App extends React.Component {
  render() {
    return (
      <div className="panel-group">

        <div className="panel panel-success">
          <div className="panel-body">
            <div className="" id="view_container">
              <canvas id='view' width='800' height='800'></canvas>
            </div>
          </div>
        </div>
        
        <div className="panel panel-success">
          <div className="panel-body">
            <div>
              <div>FPS: <span id="fps_counter"></span></div>
              <div>mouse position: <span id="mouse_pos">{0, 0}</span></div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
