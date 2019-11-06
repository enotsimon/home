// @flow
import React from 'react'

import type { DrawerDebugInfoUnit } from 'experimental/drawer'

type Props = {
  additional: Array<DrawerDebugInfoUnit>,
  init: () => void,
}

export class Sample extends React.Component<Props> {
  componentDidMount() {
    console.log('COMPONENT MOUNT')
    this.props.init()
  }

  componentDidUpdate() {
    console.log('COMPONENT UPDATE')
    this.props.init()
  }

  // bad. but i dont care for now
  // TODO fix to Link
  goBack() {
    window.location.href = '/samples_collection'
  }

  render() {
    return (
      <div style={{ maxWidth: '1280px' }}>
        <div className="panel-group">

          <div className="panel panel-success">
            <div className="panel-body">
              <div className="" id="back_link">
                <button type="button" className="btn btn-success btn" onClick={this.goBack}>
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
                {this.props.additional.map(e => (
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
      </div>
    )
  }
}
