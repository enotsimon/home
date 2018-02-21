import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

class ShowHideBlock extends React.Component {
  render() {
    return this.props.show_on_phases.indexOf(this.props.game_phase) === -1 ? null : this.props.children;
  }
}

ShowHideBlock.propTypes = {
  show_on_phases: PropTypes.arrayOf(PropTypes.string).isRequired,
  game_phase: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    game_phase: state.game_phase,
  }
}

export default connect(mapStateToProps)(ShowHideBlock)
