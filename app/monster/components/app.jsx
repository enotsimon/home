
import React from 'react';
import MainMenu from 'monster/components/main_menu';
import Scene from 'monster/components/scene';

export default class App extends React.Component {
  


  render() {
    return (
      <div className="row">
        <div className="col-md-8 col-md-offset-2">

          <Scene/>

          <MainMenu/>

        </div>
      </div>
    );
  }
}
