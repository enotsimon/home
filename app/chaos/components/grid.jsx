
import React from 'react';

export default class Grid extends React.Component {
  render() {
    return (
      <table style={{border: '1px'}}>
        {this.props.data.map((line, i) => {
          return (<tr key={'y'+i}>{line.map((element, j) => {
            return (
              <td key={'x'+j}>
                <span style={{textSize: '12px'}}>
                  {element.symbol}
                </span>
              </td>)
          })}</tr>)
        })}
      </table>
    );
  }
}
