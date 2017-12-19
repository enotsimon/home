import { connect } from 'react-redux'
import MainMenu from './main_menu';
import {main_menu_click, main_menu_subelement_click} from 'monster/actions';
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
      // very bad place for that, just a test code
      let state = game.store.getState(); // shit!
      if (state.menues.main_menu.current_element == 'go_to') {
        game.change_scene(id);
      }
      dispatch(main_menu_subelement_click(id));
    },
  };
}


const MainMenuContainer = connect(mapStateToProps, mapDispatchToProps)(MainMenu);

export default MainMenuContainer;
