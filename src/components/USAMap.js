import React from "react";
import {connect} from "react-redux"
import { useHistory } from "react-router-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import StateModel from "../models/StateModel.js"
import AreaModel from "../models/AreaModel.js"
import "./USAMap.css"
import {safeSmartNumPlaces} from "../helpers/chartHelpers.js"

// const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
// const allowableFields = ['positive', 'total', 'negative', 'posPerc', 'death', 'hospitalized']

function USAMap(props) {
  let states = props.states
  const history = useHistory();
  const perMillion = props.basis === "per-1m"

  let max = AreaModel.fieldMax(states, props.field, perMillion)
  const colorScale = scaleLinear()
    .domain([0, max])
    .range([
      "#ffffff",
      "#ff3333",
    ]);

  //TODO: where are the route helpers?
  function clickedState(state) {
    history.push("/states/" + state.abbreviation)
  }

  return (
    <ComposableMap data-tip="" projection="geoAlbersUsa">
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map(geo => {
            let color = "#EEE", value = null, tooltip = ""
            let area = StateModel.findByName(geo.properties.name)

            if(area) {
              const perCapitaEntries = perMillion ? area.scaledPerMillion() : area.entries
              value = perCapitaEntries[perCapitaEntries.length-1][props.field]
              color = colorScale(value)
              tooltip = `${area.name} -- ${safeSmartNumPlaces(value, 1)} ${props.field}s`
              if(perMillion) { tooltip += " per million people" }
            } else {
              tooltip = "unknown" //TODO: can still show area counts
            }

            return <Geography
              key={geo.rsmKey}
              geography={geo}
              onMouseEnter={() => { props.setTooltipContent(tooltip) }}
              onMouseLeave={() => { props.setTooltipContent("") }}
              onClick={() => {clickedState(area)}}
              style={{
                default: {
                  fill: color,
                  stroke: "#607D8B",
                  strokeWidth: 0.75,
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
        }
      </Geographies>
    </ComposableMap>
  );
}

const mapStateToProps = (state, ownProps) => ({
  states: state.states
})

export default connect(mapStateToProps)(USAMap)
