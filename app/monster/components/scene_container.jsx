import { connect } from 'react-redux'
import Scene from 'monster/components/scene';
import game from 'monster/monster';


const state_to_props = state => {
  let description = ''
  let name = ''
  if (state.current_scene_name) {
    let stage_text = game.config.text.scenes[state.current_scene_name]
    if (!stage_text) {
      throw({msg: 'no scene found in game.config.text.scenes by key', current_scene_name: state.current_scene_name});
    }
    description = game.config.text.scenes[state.current_scene_name].description;
    name = game.config.text.scenes[state.current_scene_name].name;
  }
  return {
    id: state.current_scene_name,
    name,
    description,
  };
}

const SceneContainer = connect(state_to_props)(Scene);

export default SceneContainer;
