// @flow
import React from 'react'
import { Link } from 'react-router-dom'

type Props = {
  init: () => void,
}

export class Sample extends React.Component<Props> {
  componentDidMount() {
    // we just pass dispatchActionTick to init()
    this.props.init()
  }

  componentDidUpdate() {
  }

  // $FlowIgnore
  render() {
    return (
      <div style={{ maxWidth: '1280px' }}>
        <div className="panel-group">

          <div className="panel panel-success">
            <div className="panel-body">
              <div className="" id="back_link">
                <Link to="./samples_collection">
                  <button type="button" className="btn btn-success btn">
                    <span className="glyphicon glyphicon-triangle-left" aria-hidden="true" />
                    &nbsp;back to collection
                  </button>
                </Link>
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

        </div>
      </div>
    )
  }
}
