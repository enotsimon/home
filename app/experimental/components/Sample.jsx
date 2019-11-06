
import React from 'react'

// bad. but i dont care for now
const goBack = () => {
  window.location.href = './samples_collection.html'
}

export const Sample = ({ additional }) => (
  <div className="panel-group">
    <div className="panel panel-success">
      <div className="panel-body">
        <div className="" id="back_link">
          <button type="button" className="btn btn-success btn" onClick={goBack}>
            <span className="glyphicon glyphicon-triangle-left" aria-hidden="true" />
            &nbsp;back to collection
          </button>
        </div>
      </div>
    </div>

    <div className="panel panel-success">
      <div className="panel-body">
        <div className="" id="view_container">
          <canvas id="view" width="800" height="800" />
        </div>
      </div>
    </div>

    <div className="panel panel-success">
      <div className="panel-body">
        <div>
          <div>
            FPS:
            <span id="fps_counter" />
          </div>
          <div>
            mouse position:
            <span id="mouse_pos">{}</span>
          </div>
          {additional.map(e => (
            <div key={e.id}>
              {e.text}
              :
              {' '}
              <span id={e.id}>{e.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

  </div>
)
