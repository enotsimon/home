import React from 'react'
import PropTypes from 'prop-types'
import {SimplePanelSuccess} from 'common/components/panel'
import PlusButton from './plus_button'

const Scenes = (props) => {
  return (
    <SimplePanelSuccess title='scenes'>
      <PlusButton on_click={props.add_scene_click} />
    </SimplePanelSuccess>
  );
}

Scenes.propTypes = {
  scenes: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
  })).isRequired,
  add_scene_click: PropTypes.func.isRequired,
}

export default Scenes
