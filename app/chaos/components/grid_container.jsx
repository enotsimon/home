
import { connect } from 'react-redux'
import Grid from 'chaos/components/grid'
import { advance_symbols_complete } from 'chaos/actions'

import chaos from 'chaos/chaos'


const mapStateToProps = state => {
  console.log('mapStateToProps.', state)
  return {
    data: chaos.data.map(line => {
      return line.map(agent => {
        return { symbol: agent.get_current_symbol('sc1') } // TEMP! sc1
      })
    })
  }
}

const mapDispatchToProps = dispatch => {
  return {
    on_element_click: id => {
      console.log('dont believe it works!!! click on', id)
      // dispatch(main_menu_click(id));
    },
  }
}

const GridContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Grid)

export default GridContainer
