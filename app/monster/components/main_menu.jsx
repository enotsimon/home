
import React from 'react';
import PropTypes from 'prop-types';
import MainMenuElement from 'monster/components/main_menu_element';

class MainMenu extends React.Component {
  render() {
    return (
      <div className="panel panel-success">
        <div className="panel-heading">
          <h4 className="panel-title">
            main menu
          </h4>
        </div>
        <div className="panel-body">
          {this.props.elements.map((e, i) => (
            <MainMenuElement key={i} {...e} on_click={() => this.props.on_element_click(e.id)} />
          ))}
        </div>
      </div>
    );
  }
}

MainMenu.propTypes = {
  elements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  on_element_click: PropTypes.func.isRequired,
};

export default MainMenu;
