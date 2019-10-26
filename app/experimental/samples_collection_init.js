import ReactDOM from 'react-dom'
import React from 'react'
import SamplesCollecton from 'experimental/components/samples_collection'

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<SamplesCollecton />, document.querySelector('#main'))
})
