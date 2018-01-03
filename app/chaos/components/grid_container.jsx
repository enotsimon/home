import { connect } from 'react-redux';
import Grid from './grid';
import * as actions from './../actions';

import chaos from 'chaos';


const mapStateToProps = state => {
  console.log('mapStateToProps.', state);
  return {
    data: [
      [],
    ],
  };
}

const mapDispatchToProps = dispatch => {
  return {
    on_element_click: id => {
      console.log('dont believe it works!!! click on', id);
      //dispatch(main_menu_click(id));
    },
  };
}


const GridContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Grid);

export default GridContainer;