import { connect } from 'react-redux'
import MainMenu from './main_menu';
import {main_menu_click, bound_main_menu_action} from 'monster/actions';
import game from 'monster/monster';


const mapStateToProps = state => {
  return {
    elements: state.menues.main_menu.elements.map(e => ({
      id: e.id,
      text: get_main_menu_control(e.id),
      active: e.id == state.menues.main_menu.current_element,
      items: e.items.map(item => ({
        id: item.id,
        text: get_item_text(item.type, item.id),
      })),
    })),
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


function get_main_menu_control(id) {
  if (!game.config.text.menues.main_menu.controls[id]) {
    throw({msg: "no main_menu controls in config.text by given id", id});
  }
  return game.config.text.menues.main_menu.controls[id];
}


function get_item_text(type, id) {
  if (!game.config.text[type]) {
    throw({msg: "no text entry in config.text by given type", type});
  }
  if (!game.config.text[type][id]) {
    throw({msg: "no text entry in config.text by given id in given category", type, id});
  }
  if (!game.config.text[type][id].name) {
    throw({msg: "no name prop by given type and id", type, id});
  }
  return game.config.text[type][id].name;
}
