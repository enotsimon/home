import { connect } from 'react-redux'
import MainMenu from './main_menu';
import {main_menu_click, bound_main_menu_action} from 'monster/actions';
import game from 'monster/monster';


const mapStateToProps = state => {
  return {
    elements: state.menues.main_menu.elements.map(e => ({...e, active: e.id == state.menues.main_menu.current_element})),
  };
}

const mapDispatchToProps = dispatch => {
  return {
    on_element_click: id => {
      dispatch(main_menu_click(id));
    },
    on_subelement_click: id => {
      bound_main_menu_action(id);
    },
  };
}


const MainMenuContainer = connect(mapStateToProps, mapDispatchToProps)(MainMenu);

export default MainMenuContainer;
