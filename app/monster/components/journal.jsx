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
            <div key={i} className='journal-entry'>
              <span style={{color: e.color, fontWeight: 'bold'}}>[{e.level}]</span>&nbsp;
              <TextEntry>{e.msg}</TextEntry>
            </div>
          ))}
        </div>
        <div className='journal-filters-container'>
          {this.props.filters.map(e => (
            <span key={'filter-'+e.id} className='journal-filter-button'>
              <StButton
                on_click={() => this.props.on_filter_click(e.id)}
                active={e.active}
                block={false}
                extra_classes='btn-xs'
              >
                <span style={{color: e.color}}>{e.text}</span>
              </StButton>
            </span>
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
  filters: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
  }).isRequired).isRequired,
  on_filter_click: PropTypes.func.isRequired,
};

export default Journal
