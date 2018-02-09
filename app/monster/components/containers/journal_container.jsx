import {connect} from 'react-redux'
//import Journal from 'monster/components/journal'
import game from 'monster/monster'
import {journal_decorate_entry} from 'monster/lib/journal'
import Journal from 'monster/components/journal'

const MAX_ENTRIES_COUNT = 10

const state_to_props = state => {
  let data = state.journal.data.slice(Math.max(state.journal.data.length - MAX_ENTRIES_COUNT, 1))
  return {
    title: game.config.text.menues.journal.name,
    data: data.map(journal_decorate_entry)
  };
}

const dispatch_to_props = dispatch => {
  return {
  };
}

const JournalContainer = connect(state_to_props, dispatch_to_props)(Journal)
export default JournalContainer
