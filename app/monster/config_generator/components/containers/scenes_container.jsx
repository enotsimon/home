import {connect} from 'react-redux'
/*import {store} from 'monster/config_generator/config_generator'*/
import Scenes from 'monster/config_generator/components/scenes'

const state_to_props = state => {
  let scenes = []
  for (let i in state.scenes) scenes = [...scenes, state.scenes[i]]
  return {
    scenes,
  }
}

const dispatch_to_props = dispatch => {
  return {
    add_scene_click: () => console.log("test sula"),
  }
}

const ScenesContainer = connect(state_to_props, dispatch_to_props)(Scenes)

export default ScenesContainer
