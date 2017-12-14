
import React from 'react';
import MainMenu from 'monster/components/main_menu';
import MainMenuContainer from 'monster/components/main_menu_container';
import Scene from 'monster/components/scene';

export default class App extends React.Component {
  


  render() {
    return (
      <div className="row">
        <div className="col-md-8 col-md-offset-2">

          <Scene/>

          <MainMenuContainer />

        </div>
      </div>
    );
  }
}
