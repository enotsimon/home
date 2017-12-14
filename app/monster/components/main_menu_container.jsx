import { connect } from 'react-redux'
import MainMenu from './main_menu';
import {main_menu_click} from 'monster/actions';


const mapStateToProps = state => {
  console.log('MainMenuContainermapStateToProps.', state);
  return {
    elements: [
      {id: 'go_to', text: 'go to ...', active: false},
      {id: 'speak_to', text: 'speak to ...', active: false},
    ],
  };
}

const mapDispatchToProps = dispatch => {
  return {
    on_element_click: id => {
      console.log('dont believe it works!!! click on', id);
      dispatch(main_menu_click(id))
    },
  };
}


const MainMenuContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MainMenu);

export default MainMenuContainer;
