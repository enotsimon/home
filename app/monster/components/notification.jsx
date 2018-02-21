
import React from 'react'
import PropTypes from 'prop-types'
//import TextEntry from './text_entry';
//import {SimplePanelSuccess} from 'common/components/panel'

const get_class_by_level = (level) => {
  if (level == 'info') {
    return 'bg-success'
  } else if (level == 'warning') {
    return 'bg-warning'
  } else if (level == 'error') {
    return 'bg-danger'
  } else {
    throw({msg: 'unknown notification level', level})
  }
}

const Notification = props => {
  //console.log('i really do')
  return (
    <div>
      {props.level && props.msg &&
        <p className={get_class_by_level(props.level) + ' notification-contaner'}>
          <span>
            <span style={{display: 'inline'}}>
              {props.msg}
            </span>
            <span style={{display: 'inline'}}>
              <button type="button" className="close" aria-label="close" onClick={props.on_close_click}>
                <span aria-hidden="true">&times;</span>
              </button>
            </span>
          </span>
          <span className='spacer'/>
        </p>}
    </div>
  )
}

Notification.propTypes = {
  level: PropTypes.string,
  msg: PropTypes.string,
  on_close_click: PropTypes.func.isRequired,
};

export default Notification
