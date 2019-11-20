// @flow
import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Link } from 'react-router-dom'

export type SamplePreviewStatus = 'draft' | 'in_progress' | 'almost_ready' | 'ready'

export type SamplePreviewConfig = {
  name: string,
  description: string,
  sample_url: string,
  img_path: string,
  status: SamplePreviewStatus,
}

const SamplePreview = (props: SamplePreviewConfig) => {
  const statusText = props.status.replace(/_/g, ' ')
  const statusClass = `status_${props.status}`
  console.log('SA', props.sample_url)
  return (
    <div className="sample_preview">
      <div className="panel panel-success" style={{ width: 220 }}>
        <div className="panel-heading">
          {/* class navbar-text? */}
          <div className="panel-title">
            {props.name}
          </div>
          <span className={`label ${statusClass}`}>
            {statusText}
          </span>
        </div>
        <div className="panel-body">
          <Link to={props.sample_url} className="thumbnail">
            <img alt="sample preview" width="200" height="200" src={props.img_path} />
          </Link>
          <div>
            <p>{props.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SamplePreview
