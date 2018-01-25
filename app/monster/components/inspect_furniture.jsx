
import React from 'react'
import PropTypes from 'prop-types'
import TextEntry from './text_entry'
import {SimplePanelSuccess} from 'common/components/panel'
import StButton from './st_button'

const on_item_click = (id_item) => {
  console.log('on_item_click', id_item);
}

const InspectFurniture = (props) => {
  return (
    <SimplePanelSuccess title={props.furniture_name}>
      <TextEntry>
        {props.description}
      </TextEntry>

      <div className="spacer"></div>

      <SimplePanelSuccess title={props.items_list_text}>
        {props.items_list.map(id_item =>
          <StButton key={id_item} on_click={on_item_click} block={false}>
            {id_item}
          </StButton>
        )}
      </SimplePanelSuccess>
    </SimplePanelSuccess>
  );
}

InspectFurniture.propTypes = {
  furniture_name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  items_list_text: PropTypes.string.isRequired,
  items_list: PropTypes.array.isRequired,
};

export default InspectFurniture;
