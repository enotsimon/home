
import React from 'react';
import MainMenu from 'monster/components/main_menu';
import MainMenuContainer from 'monster/components/main_menu_container';
import SceneContainer from 'monster/components/scene_container';

export default class App extends React.Component {
  render() {
    return (
      <div id="main" style={{marginTop: '20px', marginBottom: '20px'}}>
        <div className="row">
          <div className="col-md-8 col-md-offset-2">

            <SceneContainer />

            <MainMenuContainer />

          </div>
        </div>
      </div>
    );
  }
}
