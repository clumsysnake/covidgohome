import React from 'react'

export default function Stat(props) {
  return <li className="stats-line">
    <span className="label">{props.label}</span>
    <span className="value">{props.value || props.children}</span>
  </li>
}
