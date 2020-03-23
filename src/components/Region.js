import React from "react"
import "./Region.css"

class Region extends React.Component {
  render() {
    return (
      <div className="region">
        <span className="region-header">{this.props.region.name}</span>
        {this.props.children}
      </div>
    )
  }
}

Region.propTypes = {
  // region
  // children
}

export default Region