import React from "react";
import {connect} from "react-redux"
import { useHistory } from "react-router-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear, scaleLog, scalePow } from "d3-scale";
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
    case "state":
      areas = props.states
      areaFindF = geo => StateModel.findByName(geo.properties.name)
      clickedAreaF = (state) => history.push("/states/" + state.abbreviation)
      break
    default:
      throw new TypeError("error, unknown granularity")
  }

  let max = AreaModel.fieldMax(areas, props.field, props.basis)
  let topo = topologyForState(props.state, props.granularity)
  let projection = projectionForState(props.state)

  let colorF;
  switch(props.colorScale) {
    case 'linear':
      colorF = scaleLinear([0, max], ["white","red"]);
      break;
    case 'log2':
      colorF = scaleLog().base(2).domain([1,max]).range(["white","red"]);
      break;
    case 'sqrt':
      colorF = scalePow().exponent(0.5).domain([0,max]).range(["white","red",]);
      break;
    default:
      throw new TypeError(`error, unknown colorScale ${props.colorScale}`)
  }

  return (
    <ComposableMap data-tip="" projection={projection}>
      <Geographies geography={topo}>
        {({ geographies }) => {
        // debugger
          return geographies.map(geo => {
            let color = "#BBBBBB", tooltip = ""

            let area = areaFindF(geo)
            if(area) {
              //TODO: handle if area doesn't have population data.

              let value, tooltipValue;
              switch(props.basis) {
                case 'absolute':
                  value = _.last(area.entries)[props.field]
                  tooltipValue = value
                  break;
                case 'per-1m':
                  value = _.last(area.scaledPerMillion())[props.field]
                  tooltipValue = value
                  break;
                case 'squared-per-1m':
                  //still want to show per 1m tooltip values
                  value = _.last(area.scaledSquaredPerMillion())[props.field]
                  tooltipValue = _.last(area.scaledPerMillion())[props.field]
                  break;
                default:
                  throw new TypeError(`error, unknown bases ${props.basis}`)
              }

              if(_.isFinite(value)) { color = colorF(value || 1) }
              tooltip = `${area.name} -- ${safeSmartNumPlaces(tooltipValue, 1)} ${props.field}s`
              if(perMillion) { tooltip += " per million people" }
            } else {
              tooltip = "unknown" //TODO: can still show area counts
            }

            return <Geography
              key={geo.rsmKey}
              geography={geo}
              onMouseEnter={() => { props.setTooltipContent(tooltip) }}
              onMouseLeave={() => { props.setTooltipContent("") }}
              onClick={() => {clickedAreaF(area)}}
              style={{
                default: {
                  fill: color,
                  stroke: "#607D8B",
                  strokeWidth: 0.25,
                  outline: "none",
                },
                hover: {
                  fill: color,
                  stroke: "#607D8B",
                  strokeWidth: 2,
                  outline: "none",
                  cursor: "pointer"
                },
                pressed: {
                  fill: color,
                  stroke: "black",
                  strokeWidth: 2,
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