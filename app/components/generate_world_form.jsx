import React from 'react';

export default class GenerateWorldForm extends React.Component {
  render() {
    return (
      <div>
        <form className="form-horizontal">
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              <button type="button" className="btn btn-default" id="generate_world">generate</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
