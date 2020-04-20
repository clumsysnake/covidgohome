import React from "react";
import PropTypes from "prop-types"
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import _ from '../lodash.js'

const VALID_OPTIONS = ['onMouseEnter', 'onMouseLeave', 'style', 'onClick']

export default function Map(props) {
  return (
    <ComposableMap data-tip="" projection={props.projection}>
      <Geographies geography={props.topo}>
        {({ geographies }) => {
          return geographies.map(geo => {
            let geoProps = _.pick(props.mappingFunction(geo), VALID_OPTIONS)

            return <Geography
              geography={geo}
              key={geo.rsmKey}
              {...geoProps}
            />
          })
        }}
      </Geographies>
    </ComposableMap>
  )
}

Map.propTypes = {
  //projection: viewpoint of what we're drawing
  //topo: topologies to draw, object or url string
  mappingFunction: PropTypes.func // returns any of VALID_OPTIONS
}