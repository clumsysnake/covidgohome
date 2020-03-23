import React from "react"

class Region extends React.Component {
  render() {
    return (
      <div>
        <span>Region: {this.props.region}</span>

      </div>
    )
  }
}

Region.propTypes = {
  // region
  // states
}

export default Region