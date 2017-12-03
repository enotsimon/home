
import React from 'react';

export default class SamplePreview extends React.Component {
  constructor(props) {
    super();
    const valid_statuses = ['draft', 'in_progress', 'almost_ready', 'ready'];

    if (!props.name || !props.description || !props.sample_url || !props.img_path || !props.status) {
      console.log('some params missing', props);
      throw('some params missing');
    }
    if (valid_statuses.indexOf(props.status) == -1) {
      console.log('wrong status', props.status);
      throw('wrong status');
    }
    this.state = {status_text: props.status.replace(/_/g, ' ')};
  }


  render() {
    return (
      <div className="sample_preview">
        <div className="panel panel-success" style={{width: 250}}>
          <div className="panel-heading">
            {/* class navbar-text?*/}
            <div className="panel-title">
              {this.props.name}
            </div>
            <span className={`label label-primary status_${this.props.status}`}>
              {this.state.status_text}
            </span>
          </div>
          <div className="panel-body">
            <a href={this.props.sample_url} className="thumbnail">
              <img width="200" height="200" src={this.props.img_path}/>
            </a>
            <div className="">
              <p>{this.props.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
