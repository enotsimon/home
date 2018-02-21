import {connect} from 'react-redux'

import {journal_filter_click} from 'monster/actions'
import game from 'monster/monster'
import {journal_decorate_entry, journal_availible_levels, msg_level_colors} from 'monster/lib/journal'
import Journal from 'monster/components/journal'

const MAX_ENTRIES_COUNT = 100

const state_to_props = state => {
  let data = state.journal.data.filter(e => state.journal.enabled_levels.indexOf(e.level) !== -1)
  data.slice(Math.max(state.journal.data.length - MAX_ENTRIES_COUNT, 1))
  return {
    title: game.config.text.menues.journal.name,
    data: data.map(journal_decorate_entry),
    filters: journal_availible_levels().map(e => ({
      id: e,
      text: e,
      color: msg_level_colors[e],
      active: state.journal.enabled_levels.indexOf(e) !== -1,
    })),
  }
}

const dispatch_to_props = dispatch => {
  return {
    on_filter_click: (level) => dispatch(journal_filter_click(level))
  };
}

const JournalContainer = connect(state_to_props, dispatch_to_props)(Journal)
export default JournalContainer
