import React from 'react'
import './Filter.css'

export default function(props) {
  //TODO: accept name=? or extra classNames?
  return <div className="filter-control">
    <span className="filter-label">{(props.label) ? `${props.label}:` : null}</span>
    {props.options.map(option => filterOption(props.accessors, option))}
  </div>
}

//TODO: fix not having a key=. make into proper function component?
const filterOption = function(accessors, option) {
  let [value, displayValue] = (typeof option === "string") ? [option, option] : [option[0], option[1]]

  return <span className="filter-option">
    {(accessors[0] === value) ? displayValue : <button
      onClick={() => accessors[1](value)}>{displayValue}
    </button>}
  </span>
}