import React from 'react';

export default class DebugInfo extends React.Component {
  render() {
    return (
      <div>
        <div>FPS: <span id="fps_counter"></span></div>
        <div>map scale: <span id="map_scale"></span></div>
        <div>mouse position: <span id="mouse_pos">{0, 0}</span></div>
        <div>world point: <span id="world_pos">{0, 0}</span></div>
      </div>
    );
  }
}
