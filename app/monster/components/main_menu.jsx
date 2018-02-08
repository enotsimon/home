
import React from 'react';
import PropTypes from 'prop-types';
import {SimplePanelSuccess} from 'common/components/panel'
import MainMenuElement from 'monster/components/main_menu_element';
import MainMenuSublement from 'monster/components/main_menu_subelement';

const MainMenu = (props) => {
  return (
    <SimplePanelSuccess title={props.title}>
      <div className="col-md-6">
        {props.elements.map((e, i) => {
          return <MainMenuElement key={i} on_click={() => props.on_element_click(e.id)} {...e} />
        })}
      </div>
      <div className="col-md-6">
        {props.subelements.map((e, i) => {
          return <MainMenuSublement key={i} on_click={() => props.on_subelement_click(e.id)} {...e} />
        })}
      </div>
    </SimplePanelSuccess>
  )
}

MainMenu.propTypes = {
  title: PropTypes.string.isRequired,
  elements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      active: PropTypes.bool.isRequired,
      enabled: PropTypes.bool.isRequired,
    })
  ).isRequired,
  subelements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
  on_element_click: PropTypes.func.isRequired,
  on_subelement_click: PropTypes.func.isRequired,
};

export default MainMenu;
