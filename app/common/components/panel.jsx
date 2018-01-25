import React from 'react'
import PropTypes from 'prop-types'

const Panel = (props) => {
  return (
    <div className={"panel panel-" + props.type}>
      {props.children}
    </div>
  );
}
Panel.propTypes = {
  type: PropTypes.oneOf(['success']).isRequired,
}
export {Panel}

const SimplePanel = (props) => {
  return (
    <Panel type={props.type}>
      <PanelTitle>
        {props.title}
      </PanelTitle>
      <PanelBody>
        {props.children}
      </PanelBody>
    </Panel>
  );
}
SimplePanel.propTypes = {
  type: PropTypes.oneOf(['success']).isRequired,
  title: PropTypes.string.isRequired,
}
export {SimplePanel}

export const PanelSuccess = (props) => {
  return (
    <Panel type="success">
      {props.children}
    </Panel>
  );
}

const SimplePanelSuccess = (props) => {
  return (
    <SimplePanel type="success" title={props.title}>
      {props.children}
    </SimplePanel>
  );
}
SimplePanelSuccess.propTypes = {
  title: PropTypes.string.isRequired,
}
export {SimplePanelSuccess}

export const PanelTitle = (props) => {
  return (
    <div className="panel-heading">
      <h4 className="panel-title">
        {props.children}
      </h4>
    </div>
  );
}

export const PanelBody = (props) => {
  return (
    <div className="panel-body">
      {props.children}
    </div>
  );
}
