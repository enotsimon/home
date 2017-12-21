
import React from 'react';
import PropTypes from 'prop-types';

class TextEntry extends React.Component {
  color_by_type(type) {
    switch (type) {
      case undefined:
        return 'black';
      case 'mobiles':
        return '#d76e00'; // kinda orange
      case 'scenes':
        return 'green';
      case 'furniture':
        return 'blue';
      case 'items':
        return 'darkgreen'; // 
      case 'info':
        return '#b60aff' // kinda purple
      default:
        throw({msg: "unknown type", type});
    }
  }

  font_weight_by_type(type) {
    return type == undefined ? 'normal' : 'bold';
  }


  parse_text_part(part) {
    let text, type, target;
    [text, type, target] = part.split('|');
    return {text, type, target};
  }


  parse_paragraph(paragraph) {
    let parts = paragraph.split(/[{}]/);
    return parts.map(part => this.parse_text_part(part));
  }

  render() {
    let text_block = (e, i) => this.parse_paragraph(e).map((part, j) => (
      // @TOSO move styles to CSS
      <span key={''+i+'-'+j} style={{color: this.color_by_type(part.type), fontWeight: this.font_weight_by_type(part.type)}}>{part.text}</span>
    ));

    if (this.props.children instanceof Array) {
      return (<div>{this.props.children.map((e, i) => (<p key={i}>{text_block(e, i)}</p>))}</div>);
    } else {
      return (<span>{text_block(this.props.children, 0)}</span>);
    }

  }
}

TextEntry.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
};

export default TextEntry;
