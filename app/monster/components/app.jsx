
import React from 'react';
import MainMenu from 'monster/components/main_menu';
import Scene from 'monster/components/scene';

export default class App extends React.Component {
  


  render() {
    // TEMPORARY FAKE DATA
    let main_menu_data = {
      elements: [
        {id: 'go_to', text: 'go to ...', active: false},
        {id: 'speak_to', text: 'speak to ...', active: false},
      ],
      on_element_click: (id) => console.log('dont believe it works! click on', id),
    };

    return (
      <div className="row">
        <div className="col-md-8 col-md-offset-2">

          <Scene/>

          <MainMenu {...main_menu_data}/>

        </div>
      </div>
    );
  }
}
