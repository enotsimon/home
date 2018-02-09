import React from 'react';
import PropTypes from 'prop-types';

import TextEntry from './text_entry'
import {SimplePanelSuccess} from 'common/components/panel'
import StButton from './st_button'

const Journal = (props) => {
  return (
    <SimplePanelSuccess title={props.title}>
      <pre>
        {props.data.map((e, i) => (
          <div key={i}>
            <span style={{color: e.color, fontWeight: 'bold'}}>[{e.level}]</span>&nbsp;
            <TextEntry>{e.msg}</TextEntry>
          </div>
        ))}
      </pre>
    </SimplePanelSuccess>
  );
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
