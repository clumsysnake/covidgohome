import React from "react"
import PropTypes from 'prop-types';
import "./Group.css"

export default function Group(props) {
  return (
    <div className="group">
      <span className="group-header">{props.name}</span>
      {props.children}
    </div>
  )
}

Group.propTypes = {
  name: PropTypes.string,
  children: PropTypes.array  //of components
}