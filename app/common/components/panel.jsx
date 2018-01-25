import React from 'react'

export const PanelSuccess = (props) => {
  return (
    <div className="panel panel-success">
      {props.children}
    </div>
  );
}

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
