// @flow
import SamplePreview from 'experimental/components/sample_preview'
import React from 'react'

import type { SamplePreviewConfig } from 'experimental/components/sample_preview'

const wbConfig: Array<SamplePreviewConfig> = [
  {
    name: 'moving arrows',
    description: 'schizophreniac arrows moving all around',
    sample_url: './moving_arrows',
    img_path: './thumbnails/moving_arrows.png',
    status: 'almost_ready',
  },
  /*
  {
    name: 'planets focus',
    description: `star system emulation, where we
      dynamically change focus on random stellar body,
      i.e. move it to the center of coordinates and make all others spin around it`,
    sample_url: './planets_focus',
    img_path: './thumbnails/planets_focus.jpg',
    status: 'draft',
  },
  */
  {
    name: 'basic random tableau',
    description: 'random start configuration, pixels change their colors with edgy jump from white to black',
    sample_url: './basic_tableau',
    img_path: './thumbnails/basic_tableau.jpg',
    status: 'ready',
  },
  /*
  {
    name: 'smooth random tableau',
    description: 'random start configuration, pixels change their colors smoothly -- black to white and backward',
    sample_url: './smooth_tableau',
    img_path: './thumbnails/smooth_tableau.jpg',
    status: 'ready',
  },
  */
  {
    name: 'rule 30',
    description: 'cellular automaton evolution of rule 30 introduced by stephen wolfram in 1983',
    sample_url: './rule_30',
    img_path: './thumbnails/rule_30.jpg',
    status: 'ready',
  },
  {
    name: 'vichniac vote',
    description: `the color of cell depends on number of black cell in its moore neighborhood and previous
      self color -- it is black if total numbler black cells is greater than 4`,
    sample_url: './vichniac_vote',
    img_path: './thumbnails/vichniac_vote.jpg',
    status: 'ready',
  },
  /*
  {
    name: 'orbits',
    description: 'experiment with 3d polar functions',
    sample_url: './orbits',
    img_path: './thumbnails/orbits.jpg',
    status: 'draft',
  },
  */
  {
    name: 'luna',
    description: 'its like moon -- planet with craters on surface',
    sample_url: './luna',
    img_path: './thumbnails/luna.jpg',
    status: 'ready',
  },
  {
    name: 'wavy sphere',
    description: 'sphere with waves',
    sample_url: './wavy_sphere',
    img_path: './thumbnails/wavy_planet.jpg',
    status: 'ready',
  },
]

const colorConfig: Array<SamplePreviewConfig> = [
  {
    name: 'lloyd relaxation',
    description: 'basic example of lloyd relaxation on voronoi diagram',
    sample_url: './voronoi_lloyd',
    img_path: './thumbnails/lloyd_basic.png',
    status: 'ready',
  },
  {
    name: 'lloyd waves center',
    description: 'new points from the center of circle wave by vawe. and all scene is rotating',
    sample_url: './voronoi_lloyd_vawes',
    img_path: './thumbnails/lloyd_waves_center_2.png',
    status: 'ready',
  },
  {
    name: 'lloyd waves random',
    description: 'new points burst in random places. no scene rotation',
    sample_url: './voronoi_lloyd_vawes_rand',
    img_path: './thumbnails/lloyd_waves_rand.png',
    status: 'almost_ready',
  },
]

const SamplesCollecton = () => (
  <div style={{ margin: '20px' }}>
    <div className="col-md-8 col-md-offset-2">
      <div>
        <h3>
          a collection of funny graphics samples
        </h3>
      </div>
      <div className="panel panel-success">
        <div className="panel-heading">
          <h4 className="panel-title">
            w/b
          </h4>
        </div>
        <div className="panel-body">
          {wbConfig.map(e => React.createElement(SamplePreview, { ...e, key: e.name }))}
        </div>
        <div className="panel-heading">
          <h4 className="panel-title">
            color
          </h4>
        </div>
        <div className="panel-body">
          {colorConfig.map(e => React.createElement(SamplePreview, { ...e, key: e.name }))}
        </div>
      </div>
    </div>
  </div>
)

export default SamplesCollecton
