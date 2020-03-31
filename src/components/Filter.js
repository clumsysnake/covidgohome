import React from 'react'
import './Filter.css'

export default function(props) {
  //TODO: accept name=? or extra classNames?
  return <div className="filter-control">
    {(props.label) ? `${props.label}:` : null}
    {props.options.map(o => filterOption(props.accessors, o[0], o[1]))}
  </div>
}

const filterOption = function(accessors, value, displayString) {
  return <span className="filter-option">
    {(accessors[0] === value) ? displayString : <button
      onClick={() => accessors[1](value)}>{displayString}
    </button>}
  </span>
}