
import React from 'react'

export default class Grid extends React.Component {
  render() {
    const size = '30px'

    return (
      <table>
        <tbody>
          {this.props.data.map((line, i) => {
            return (
              <tr key={`y${i}`}>
                {line.map((element, j) => {
                  return (
                    <td key={`x${j}`} style={{ borderCollapse: 'collapse', border: '1px solid black', width: size, height: size, textAlign: 'center' }}>
                      <span style={{ fontSize: '20px' }}>
                        {element.symbol}
                      </span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
}
