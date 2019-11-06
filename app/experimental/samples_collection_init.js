import ReactDOM from 'react-dom'
import React from 'react'
import SamplesCollecton from 'experimental/components/samples_collection'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'assets/css/main.css'

ReactDOM.render(
  <div style={{ margin: '20px' }}>
    <SamplesCollecton />
  </div>,
  document.body.appendChild(document.createElement('div'))
)
