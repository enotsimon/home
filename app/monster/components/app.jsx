// @flow
import React from 'react'

import MainMenuContainer from './containers/main_menu_container'
import SceneContainer from './containers/scene_container'
import DialogContainer from './containers/dialog_container'
import InspectFurnitureContainer from './containers/inspect_furniture_container'
import ShowHideBlock from './containers/show_hide_block'
import JournalContainer from './containers/journal_container'
import NotificationContainer from './containers/notification_container'

type AppProps = {
  show_scene_phases: Array<string>,
  show_dialog_phases: Array<string>,
  show_main_menu_phases: Array<string>,
  show_furniture_phases: Array<string>,
}

export default function App(props: AppProps) {
  return (
    <div id="main" style={{marginTop: '20px', marginBottom: '20px'}}>
      <div className="row">
        <div className="col-md-8 col-md-offset-2">

          <ShowHideBlock show_on_phases={props.show_scene_phases}>
            <SceneContainer />
          </ShowHideBlock>

          <ShowHideBlock show_on_phases={props.show_dialog_phases}>
            <DialogContainer />
          </ShowHideBlock>

          <ShowHideBlock show_on_phases={props.show_furniture_phases}>
            <InspectFurnitureContainer />
          </ShowHideBlock>

          <ShowHideBlock show_on_phases={props.show_main_menu_phases}>
            <MainMenuContainer />
          </ShowHideBlock>

          {/* we show journal and notifications alwais */}
          <NotificationContainer/>
          <JournalContainer/>
        </div>
      </div>
    </div>
  )
}
