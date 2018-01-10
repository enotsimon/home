import { connect } from 'react-redux'
import Scene from 'monster/components/scene';
import game from 'monster/monster';


const mapStateToProps = state => {
  // TODO move it all from here
  let description = '';
  if (state.current_scene_name) {
    if (!game.config.text.scenes[state.current_scene_name]) {
      description = 'error -- no scene found in game.config.text.scenes by key ' + state.current_scene_name;
    }
    if (!game.config.text.scenes[state.current_scene_name].description) {
      description = 'error -- no scene description in game.config.text.scenes by key ' + state.current_scene_name;
    }
    description = game.config.text.scenes[state.current_scene_name].description;
  } else {
    description = 'error -- state.current_scene_name';
  }
  return {
    id: state.current_scene_name,
    name: state.current_scene_name,
    description: description,
  };
}

const SceneContainer = connect(mapStateToProps)(Scene);

export default SceneContainer;
