import React from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import TextEntry from './text_entry'
import {SimplePanelSuccess} from 'common/components/panel'
import StButton from './st_button'

class Journal extends React.Component {
  componentDidMount() {
    this.scroll_to_bottom()
  }

  componentDidUpdate() {
    this.scroll_to_bottom()
  }

  scroll_to_bottom() {
    let journal_container = ReactDOM.findDOMNode(this.journal_container)
    journal_container.scrollTop = journal_container.scrollHeight
  }

  render() {
    return (
      <SimplePanelSuccess title={this.props.title}>
        <div className='journal-container' ref={e => this.journal_container = e}>
          {this.props.data.map((e, i) => (
            <div key={i}>
              <span style={{color: e.color, fontWeight: 'bold'}}>[{e.level}]</span>&nbsp;
              <TextEntry>{e.msg}</TextEntry>
            </div>
          ))}
        </div>
      </SimplePanelSuccess>
    )
  }
}

Journal.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    level: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    msg: PropTypes.string.isRequired,
  }).isRequired).isRequired,
};

export default Journal
