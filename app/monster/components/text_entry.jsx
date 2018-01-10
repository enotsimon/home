
import React from 'react';
import PropTypes from 'prop-types';

class TextEntry extends React.Component {
  class_by_type(type) {
    switch (type) {
      case undefined:
        return 'default-text';
      case 'mobiles':
        return 'mobiles-text';
      case 'scenes':
        return 'scenes-text';
      case 'furniture':
        return 'furniture-text';
      case 'items':
        return 'items-text';
      case 'info':
        return 'info-text';
      default:
        throw({msg: "unknown type", type});
    }
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
      <span key={''+i+'-'+j} className={this.class_by_type(part.type)}>{part.text}</span>
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
