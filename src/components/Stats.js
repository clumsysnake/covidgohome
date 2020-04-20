import React from 'react'

export default function Stats(props) {
  return <ul className="stats-table">
    {props.children}
  </ul>
}