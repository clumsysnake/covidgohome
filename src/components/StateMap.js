import React from "react";
import {connect} from "react-redux"
import { useHistory } from "react-router-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { colorScale } from '../helpers/chartHelpers'
import _ from 'lodash'

import { projectionForState, topologyForState } from '../stores/Topologies.js'
import StateModel from "../models/StateModel.js"
import CountyModel from "../models/CountyModel.js"
import AreaModel from "../models/AreaModel.js"
// import "./StateMap.css"
import {safeSmartNumPlaces} from "../helpers/chartHelpers.js"

// const allowableFields = ['positive', 'total', 'negative', 'posPerc', 'death', 'hospitalized']

function StateMap(props) {
  const history = useHistory();
  const perMillion = ["per-1m", "squared-per-1m"].includes(props.basis)

  let areas, areaFindF, clickedAreaF;
  switch(props.granularity) {
    case "county":
      areas = props.state.counties
      areaFindF = geo => CountyModel.findByFips(parseInt(geo.id))
      clickedAreaF = (county) => history.push("/states/" + county.state.abbreviation)
      break
    case "state": //TODO: is this ever gonna be used?
      areas = [props.state]
      areaFindF = geo => StateModel.findByName(geo.properties.name)
      clickedAreaF = (state) => history.push("/states/" + state.abbreviation)
      break
    default:
      throw new TypeError("error, unknown granularity")
  }

  let max = AreaModel.fieldMax(areas, props.field, props.basis)
  let colorF = colorScale(props.colorScale, max)
  let topo = topologyForState(props.state, props.granularity, 2) //2 so neighbors of neighbors are displayed
  let projection = projectionForState(props.state)

  return (
    <ComposableMap data-tip="" projection={projection}>
      <Geographies geography={topo}>
        {({ geographies }) => {
          return geographies.map(geo => {
            let color = "#DDDDDD", tooltip = ""

            let area = areaFindF(geo)
            if(area) {
              //TODO: handle if area doesn't have population data.

              let value, tooltipValue;
              switch(props.basis) {
                case 'total':
                  value = _.last(area.entries)[props.field]
                  tooltipValue = value
                  break;
                case 'per-1m':
                  value = _.last(area.scaledPerMillion())[props.field]
                  tooltipValue = value
                  break;
                case 'squared-per-1m':
                  //We still want to show per 1m tooltip values
                  value = _.last(area.scaledSquaredPerMillion())[props.field]
                  tooltipValue = _.last(area.scaledPerMillion())[props.field]
                  break;
                default:
                  throw new TypeError(`error, unknown bases ${props.basis}`)
              }

              if(_.isFinite(value)) { color = colorF(value) }
              tooltip = `${area.name} -- ${safeSmartNumPlaces(tooltipValue, 1)} ${props.field}s`
              if(perMillion) { tooltip += " per million people" }
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

//proptypes: states, counties, granularity, field, basis, scale

export default connect(mapStateToProps)(StateMap)