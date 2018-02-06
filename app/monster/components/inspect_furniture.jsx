
import React from 'react'
import PropTypes from 'prop-types'
import TextEntry from './text_entry'
import {SimplePanelSuccess} from 'common/components/panel'
import StButton from './st_button'

const container_data = (title, items_list, on_list_item_click, active_item, on_button_click, button_text) => {
  return (
    <SimplePanelSuccess title={title}>
      {items_list.map(e => {
        let active = e.id === active_item.id
        return (<StButton key={e.id} on_click={() => on_list_item_click(e.id)} block={false} active={active}>
          {e.name}
        </StButton>)
      })}
      {active_item.id &&
        <div>
          <div className='spacer'></div>
          <TextEntry>{active_item.description}</TextEntry>
          <div className='spacer'></div>
          <StButton on_click={() => on_button_click(active_item.id)} block={false}>
            {button_text}
          </StButton>
        </div>
      }
    </SimplePanelSuccess>
  )
}

const InspectFurniture = (props) => {
  return (
    <SimplePanelSuccess title={props.furniture_name}>
      <TextEntry>
        {props.description}
      </TextEntry>

      <div className="spacer"></div>

      {container_data(
        props.items_list_text,
        props.items_list,
        (id) => props.on_item_click(id, false),
        props.active_item,
        props.on_pick_up_item_click,
        props.pick_up_text
      )}

      {container_data(
        props.inventory_text,
        props.inventory_items_list,
        (id) => props.on_item_click(id, true),
        props.inventory_active_item,
        props.on_drop_item_click,
        props.drop_text
      )}
    </SimplePanelSuccess>
  );
}

const item_data = PropTypes.shape({
  id: PropTypes.string, // or null
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
})

InspectFurniture.propTypes = {
  items_list_text: PropTypes.string.isRequired,
  pick_up_text: PropTypes.string.isRequired,
  drop_text: PropTypes.string.isRequired,
  inventory_text: PropTypes.string.isRequired,
  furniture_name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  items_list: PropTypes.arrayOf(item_data).isRequired,
  inventory_items_list: PropTypes.arrayOf(item_data).isRequired,
  active_item: item_data, // string or null
  inventory_active_item: item_data, // string or null
  on_item_click: PropTypes.func.isRequired,
  on_pick_up_item_click: PropTypes.func.isRequired,
};

export default InspectFurniture;
