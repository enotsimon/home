import React from 'react';

export default class App extends React.Component {
  render() {
    return (
      <small>
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

              <div className="panel panel-success">
                <div className="panel-heading">
                  <h4 className="panel-title">
                    <a data-toggle="collapse" href="#menu-element-3">debug <span className="caret"></span></a>
                  </h4>
                </div>
                <div id="menu-element-3" className="panel-collapse collapse">
                  <div className="panel-body">
                    
                    <div>FPS: <span id="fps_counter"></span></div>
                    <div>map scale: <span id="map_scale"></span></div>
                    <div>mouse position: <span id="mouse_pos">{0, 0}</span></div>
                    <div>world point: <span id="world_pos">{0, 0}</span></div>
                    
                  </div>
                </div>
              </div>
            </div>

          </td>
          <td width="100%">

            <div className="panel-group">
              <div className="panel panel-success">
                <div className="panel-body">

                  <div className="panel panel-success">
                    <div className="panel-heading">
                      <h4 className="panel-title">
                        <a data-toggle="collapse" href="#menu-element-1">world generating <span className="caret"></span></a>
                      </h4>
                    </div>
                    <div id="menu-element-1" className="panel-collapse collapse">
                      <div className="panel-body">
                        
                        <form className="form-horizontal">
                          <div className="form-group">
                            <div className="col-sm-offset-2 col-sm-10">
                              <button type="button" className="btn btn-default" id="generate_world">generate</button>
                            </div>
                          </div>
                        </form>

                      </div>
                    </div>
                  </div>

                  <div className="panel panel-success">
                    <div className="panel-heading">
                      <h4 className="panel-title">
                        <a data-toggle="collapse" href="#menu-element-2">roads <span className="caret"></span></a>
                      </h4>
                    </div>
                    <div id="menu-element-2" className="panel-collapse collapse">
                      <div className="panel-body">

                        <p>in test mode for now, nothing works...</p>
                        <button type="button" className="btn btn-success" id="build_road">build road</button>
                        <div id="road_text"></div>
                        
                      </div>
                    </div>
                  </div>

                </div>
                <div className="panel-footer">
                  <div className="panel panel-success">
                    <div className="panel-heading">
                      <h4 className="panel-title">
                        <a data-toggle="collapse" href="#menu-element-5">legend <span className="caret"></span></a>
                      </h4>
                    </div>
                    <div id="menu-element-5" className="panel-collapse collapse">
                      <div className="panel-body">
                        <p>here will be map legend...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </td>
        </tr>
      </tbody>
      </table>
      </small>

    );
  }
}
