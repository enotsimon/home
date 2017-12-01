
import React from 'react';
import PropTypes from 'prop-types';
import MainMenuElement from 'monster/components/main_menu_element';

class MainMenu extends React.Component {
  on_element_click(e) {
    //this.props.elements.forEach(element => element.active = false);
    //e.active = true;
    this.props.on_element_click(e.id);
  }

  render() {
    return (
      <div className="panel panel-success">
        <div className="panel-heading">
          <h4 className="panel-title">
            main menu
          </h4>
        </div>
        <div className="panel-body">
          <div className="col-md-6">
            {this.props.elements.map((e, i) => (
              <MainMenuElement key={i} {...e} on_click={() => this.on_element_click(e)} />
            ))}
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
    }).isRequired
  ).isRequired,
  on_element_click: PropTypes.func.isRequired,
};

export default MainMenu;
