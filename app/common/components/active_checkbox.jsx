import React from 'react';

export default class ActiveCheckbox extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {checked: props.checked};
    console.log('SUKA', this.state);
  }

  handler(event) {
    let value = this.props.handler(event);
    this.setState({checked: value});
  }

  render() {
    return (
      <div className="form-check">
        <label className="form-check-label">
          <input className="form-check-input" type="checkbox" onChange={this.handler.bind(this)} defaultChecked={this.state.checked} />
          &nbsp;{this.props.text}
        </label>
      </div>
    );
  }
}
