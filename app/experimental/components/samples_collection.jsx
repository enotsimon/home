
import SamplePreview from "experimental/components/sample_preview";
import React from 'react';

export default class SamplesCollecton extends React.Component {
  render() {
    return (
      <div className="col-md-8 col-md-offset-2">
        <div className="panel panel-success">
          <div className="panel-heading">
            <h4 className="panel-title">
              a collection of funny graphics samples
            </h4>
          </div>
          <div className="panel-body">

            {React.createElement(SamplePreview, {
              name: 'moving arrows',
              description: `schizophreniac arrows moving all around.
                add cosinus interpolation on arrow's turns`,
              sample_url: './moving_arrows.html',
              img_path: './thumbnails/moving_arrows.png',
              status: 'almost_ready',
            })}

            {React.createElement(SamplePreview, {
              name: 'planets focus',
              description: `star system emulation, where we
                dynamically change focus on random stellar body,
                i.e. move it to the center of coordinates and make all others spin around it`,
              sample_url: './planets_focus.html',
              img_path: './thumbnails/planets_focus.jpg',
              status: 'in_progress',
            })}

            {React.createElement(SamplePreview, {
              name: 'basic tableau',
              description: `random start configuration, pixels change their colors smoothly`,
              sample_url: './basic_tableau.html',
              img_path: './thumbnails/planets_focus.jpg',
              status: 'in_progress',
            })}

          </div>
        </div>
      </div>
    );
  }
}
