import {connect} from 'react-redux'
import MainMenu from 'monster/components/main_menu';
import {main_menu_click, main_menu_subelement_click, inspect_begin, bound_change_scene} from 'monster/actions';
import game from 'monster/monster';
import {start_dialog} from 'monster/lib/dialogs'

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

const state_to_props = state => {
  let main_menu = state.menues.main_menu;
  let current_element_obj = main_menu.elements.find(e => e.id == main_menu.current_element);
  return {
    title: game.config.text.menues.main_menu.name,
    elements: main_menu.elements.map(e => ({
      id: e.id,
      text: get_main_menu_control(e.id),
      active: e.id == main_menu.current_element,
      enabled: e.items.length > 0,
    })),
    subelements: current_element_obj
      ? current_element_obj.items.map(item => ({
        id: item.id,
        text: get_item_text(item.type, item.id),
      }))
      : [],
  };
}

const dispatch_to_props = dispatch => {
  return {
    on_element_click: id => {
      dispatch(main_menu_click(id));
    },
    on_subelement_click: id_subelement => {
      let current_element = game.store.getState().menues.main_menu.current_element;
      dispatch(main_menu_subelement_click(id_subelement));
      switch (current_element) {
        case 'go_to':
          return bound_change_scene(id_subelement);
        case 'speak_to':
          return start_dialog(id_subelement);
        case 'inspect':
          return dispatch(inspect_begin(id_subelement));
        default:
          throw({msg: 'unknown main menu entry', entry: current_element});
      }
    },
  };
}

const MainMenuContainer = connect(state_to_props, dispatch_to_props)(MainMenu);
export default MainMenuContainer;
