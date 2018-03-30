
import React from 'react'
import PropTypes from 'prop-types'
import ScenesContainer from './containers/scenes_container'

class App extends React.Component {
  render() {
    return (
      <div id="main" style={{marginTop: '20px', marginBottom: '20px'}}>
        <div className="row">
          <div className="col-md-8 col-md-offset-2">

            <ScenesContainer />
            
          </div>
        </div>
      </div>
    );
  }
}

export default App