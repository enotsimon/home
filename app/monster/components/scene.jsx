
import React from 'react';
import PropTypes from 'prop-types';
import TextEntry from './text_entry';
import {SimplePanelSuccess} from 'common/components/panel'

const Scene = (props) => {
  return (
    <SimplePanelSuccess title={props.name}>
      <TextEntry>
        {props.description}
      </TextEntry>
    </SimplePanelSuccess>
  );
}

Scene.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.any.isRequired,
};

export default Scene;