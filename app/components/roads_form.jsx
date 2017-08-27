import React from 'react';

export default class RoadsForm extends React.Component {
  render() {
    return (
      <div>
        <form className="form-horizontal">
          <p>in test mode for now, nothing works...</p>
          <button type="button" className="btn btn-success" id="build_road">build road</button>
          <div id="road_text"></div>
        </form>
      </div>
    );
  }
}
