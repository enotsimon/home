import game from '../monster'
import {notification_msg, notification_close} from 'monster/actions'

const available_levels = ['info', 'warning', 'error']

export const show_notification = (level, msg) => {
  if (available_levels.indexOf(level) == -1) {
    throw({msg: 'unknown notification level', level})
  }
  game.store.dispatch(notification_msg(level, msg))
  setTimeout(() => game.store.dispatch(notification_close()), 5000)
}
