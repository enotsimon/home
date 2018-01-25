
import React from 'react'
import PropTypes from 'prop-types'
import TextEntry from './text_entry'
import {SimplePanelSuccess} from 'common/components/panel'

const InspectFurniture = (props) => {
  return (
    <SimplePanelSuccess title={props.furniture_name}>
      <TextEntry>
        {props.description}
      </TextEntry>

      <div className="spacer"></div>

      <SimplePanelSuccess title={props.items_list_text}>
        {props.items_list.map(item => <TextEntry key={item}>{item}</TextEntry>)}
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
