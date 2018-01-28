
import React from 'react'
import PropTypes from 'prop-types'
import TextEntry from './text_entry'
import {SimplePanelSuccess} from 'common/components/panel'
import StButton from './st_button'

const InspectFurniture = (props) => {
  return (
    <SimplePanelSuccess title={props.furniture_name}>
      <TextEntry>
        {props.description}
      </TextEntry>

      <div className="spacer"></div>

      <SimplePanelSuccess title={props.items_list_text}>
        {props.items_list.map(e => {
          let active = e.id_item === props.active_item
          return (<StButton key={e.id_item} on_click={() => props.on_item_click(e.id_item)} block={false} active={active}>
            {e.text}
          </StButton>)
        })}
        {props.active_item &&
          <div>
            <div className='spacer'></div>
            <StButton on_click={() => props.on_pick_up_item_click(props.active_item)} block={false}>
              {props.pick_up_text}
            </StButton>
            <StButton on_click={() => props.on_inspect_item_click(props.active_item)} block={false}>
              {props.inspect_text}
            </StButton>
          </div>
        }
      </SimplePanelSuccess>
    </SimplePanelSuccess>
  );
}

InspectFurniture.propTypes = {
  items_list_text: PropTypes.string.isRequired,
  pick_up_text: PropTypes.string.isRequired,
  inspect_text: PropTypes.string.isRequired,
  furniture_name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  items_list: PropTypes.arrayOf(
    PropTypes.shape({
      id_item: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
  active_item: PropTypes.string, // string or null
  on_item_click: PropTypes.func.isRequired,
  on_pick_up_item_click: PropTypes.func.isRequired,
  on_inspect_item_click: PropTypes.func.isRequired,
};

export default InspectFurniture;
