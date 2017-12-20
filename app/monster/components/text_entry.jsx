
import React from 'react';
import PropTypes from 'prop-types';

class TextEntry extends React.Component {
  get_color_by_type(type) {
    switch (type) {
      case undefined:
        return 'black';
      case 'mobile':
        return 'orange';
      case 'scene':
        return 'dark_green';
      case 'furniture':
        return 'dark_blue';
      case 'item':
        return 'goldenrod';
      default:
        throw({msg: "unknown type", type});
    }
  }

  render() {
    let content;
    if (this.props.children instanceof Array) {
      content = this.props.children.map((e, i) => {
        let text, type, target;
        [text, type, target] = e.split('|');
        // @TOSO move styles to CSS
        return <span key={i} style={{color: this.get_color_by_type(type)}}>{text}</span>;
      });
    } else {
      content = this.props.children;
    }

    return (
      <span>
        {content}
      </span>
    );
  }
}

TextEntry.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
};

export default TextEntry;
