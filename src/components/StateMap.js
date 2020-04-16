import _ from '../lodash.js'
import React from "react";
import {connect} from "react-redux"
import PropTypes from "prop-types"
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import * as H from '../helpers/chartHelpers'
import M from '../models.js'
import { projectionForState, topologyForState } from '../stores/Topologies.js'

//CRZ: choosing to display counties without data as white. I'm not sure if JH
//     just doesn't have data for the counties, or if they choose not to include counties
//     with all zero counts to save space.
const NO_COUNTY_DATA_COLOR = 'white'

function StateMap(props) {
  const perMillion = ["per-1m", "squared-per-1m"].includes(props.basis)

  let areas, areaFindF
  switch(props.granularity) {
    case "county":
      areas = props.state.counties
      areaFindF = geo => M.CountyModel.findByFips(parseInt(geo.id))
      break
    case "state": //TODO: is this ever gonna be used?
      areas = [props.state]
      areaFindF = geo => M.StateModel.findByName(geo.properties.name)
      break
    default:
      throw new TypeError("error, unknown granularity")
  }

  let max = M.AreaModel.fieldMax(areas, props.field, props.basis)
  let colorF = H.colorScale(props.colorScale, max)
  let topo = topologyForState(props.state, props.granularity, 2) //2 so neighbors of neighbors are displayed
  let projection = projectionForState(props.state)
  let date = props.date

  return (
    <ComposableMap data-tip="" projection={projection}>
      <Geographies geography={topo}>
        {({ geographies }) => {
          return geographies.map(geo => {
            let color = "#DDDDDD", tooltip = ""

            let area = areaFindF(geo)
            if(area && area.frames && area.frameForDate(date)) {
              let [tooltipTransform, transform] = H.basisTransforms(area, props.basis)
              let value = transform.frameForDate(date)[props.field]
              let tooltipValue = tooltipTransform.frameForDate(date)[props.field]
              color = (_.isFinite(value)) ? color = colorF(value) : NO_COUNTY_DATA_COLOR
              tooltip = `${area.name} -- ${H.safeSmartNumPlaces(tooltipValue, 1)} ${props.field}`
              if(perMillion) { tooltip += " per million people" }
            } else if(area) {
              color = NO_COUNTY_DATA_COLOR
            }

            return <Geography
              key={geo.rsmKey}
              geography={geo}
              onMouseEnter={() => { props.setTooltipContent(tooltip) }}
              onMouseLeave={() => { props.setTooltipContent("") }}
              // onClick={() => {clickedAreaF(area)}}
              style={{
                default: {
                  fill: color,
                  stroke: "#607D8B",
                  strokeWidth: area ? 2 : 1,
                  outline: "none",
                  zIndex: area ? 1 : 0
                },
                hover: {
                  fill: color,
                  stroke: "#607D8B",
                  strokeWidth: area ? 3 : 1,
                  cursor: area ? "pointer" : "arrow",
                  zIndex: area ? 1 : 0,
                  outline: "none"
                },
                pressed: {
                  fill: color,
                  stroke: area ? 'black' : "#607D8B",
                  strokeWidth: area ? 4 : 1,
                  outline: "none",
                }
              }}
            />
          })
        }}
      </Geographies>
    </ComposableMap>
  );
}

const mapStateToProps = (state, ownProps) => ({
  states: state.states,
  counties: state.counties
})

StateMap.propTypes = {
  date: PropTypes.number
}

//proptypes: states, counties, granularity, field, basis, scale

export default connect(mapStateToProps)(StateMap)