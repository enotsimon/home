
import React from 'react'
import PropTypes from 'prop-types'
import TextEntry from './text_entry'
import {PanelSuccess, PanelTitle, PanelBody} from 'common/components/panel'

const InspectFurniture = (props) => {
  return (
    <PanelSuccess>
      <PanelTitle>{props.furniture_name}</PanelTitle>
      <PanelBody>
        <TextEntry>
          {props.description}
        </TextEntry>

        <div className="spacer"></div>

        <PanelSuccess>
          <PanelTitle><TextEntry>{props.items_list_text}</TextEntry></PanelTitle>
          <PanelBody>
            {props.items_list.map(item => <TextEntry key={item}>{item}</TextEntry>)}
          </PanelBody>
        </PanelSuccess>
      </PanelBody>
    </PanelSuccess>
  );
}

InspectFurniture.propTypes = {
  furniture_name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  items_list_text: PropTypes.string.isRequired,
  items_list: PropTypes.array.isRequired,
};

export default InspectFurniture;
