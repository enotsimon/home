import React from 'react';

export default class CollapsiblePanel extends React.Component {
  constructor(args) {
    super();
    this.header = args.header;
    this.name = args.name;
    this.content_func = args.content_func;
  }

  render() {
    return (
      <div className="panel panel-success">
        <div className="panel-heading">
          <h4 className="panel-title">
            <a data-toggle="collapse" href={'#'+this.name}>{this.header} <span className="caret"></span></a>
          </h4>
        </div>
        <div id={this.name} className="panel-collapse collapse">
          <div className="panel-body">
            {this.content_func()}
          </div>
        </div>
      </div>          
    );
  }
}
