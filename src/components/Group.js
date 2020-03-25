import React from "react"
import PropTypes from 'prop-types';
import "./Group.css"

class Group extends React.Component {
  render() {
    return (
      <div className="group">
        <span className="group-header">{this.props.name}</span>
        {this.props.children}
      </div>
    )
  }
}

Group.propTypes = {
  name: PropTypes.string,
  children: PropTypes.array  //of components
}

export default Group