
import React from 'react';
import PropTypes from 'prop-types';
import MainMenuElement from 'monster/components/main_menu_element';
import MainMenuSublement from 'monster/components/main_menu_subelement';

class MainMenu extends React.Component {

  render() {
    let active_elements = this.props.elements.filter(e => e.active);
    if (active_elements.length > 1) {
      throw({msg: "more than one menu element active", active: active_elements});
    }
    let subelements = active_elements[0] ? active_elements[0].items : [];

    return (
      <div className="panel panel-success">
        <div className="panel-heading">
          <h4 className="panel-title">
            main menu
          </h4>
        </div>
        <div className="panel-body">
          <div className="col-md-6">
            {this.props.elements.map((e, i) => {
              return <MainMenuElement key={i} on_click={() => this.props.on_element_click(e.id)} {...e} />
            })}
          </div>
          <div className="col-md-6">
            {subelements.map((e, i) => {
              return <MainMenuSublement key={i} on_click={() => this.props.on_subelement_click(e.id)} {...e} />
            })}
          </div>
        </div>
      </div>
    );
  }
}

MainMenu.propTypes = {
  elements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      active: PropTypes.bool.isRequired,
      items: PropTypes.array.isRequired, // structure checked in main_menu_subelement
    }).isRequired
  ).isRequired,
  on_element_click: PropTypes.func.isRequired,
  on_subelement_click: PropTypes.func.isRequired,
};

export default MainMenu;
