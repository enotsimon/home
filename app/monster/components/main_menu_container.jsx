import { connect } from 'react-redux'
import MainMenu from './main_menu';
import {main_menu_click} from 'monster/actions';


const mapStateToProps = state => {
  return {
    elements: state.menues.main_menu.elements,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    on_element_click: id => {
      console.log('on_element_click', id);
      dispatch(main_menu_click(id));
    },
    on_subelement_click: id => {
      console.log('on_subelement_click', id);
      dispatch(main_menu_click(id));
    },
  };
}


const MainMenuContainer = connect(mapStateToProps, mapDispatchToProps)(MainMenu);

export default MainMenuContainer;
