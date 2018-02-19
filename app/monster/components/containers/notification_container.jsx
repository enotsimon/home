import {connect} from 'react-redux'

import {notification_close} from 'monster/actions'
import game from 'monster/monster'
import Notification from 'monster/components/notification'

const state_to_props = state => {
  return {
    level: state.notification.level,
    msg: state.notification.msg,
  }
}

const dispatch_to_props = dispatch => {
  return {
    on_close_click: () => dispatch(notification_close())
  };
}

const NotificationContainer = connect(state_to_props, dispatch_to_props)(Notification)
export default NotificationContainer
