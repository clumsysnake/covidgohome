import React from "react";
import {connect} from "react-redux"
import { useHistory } from "react-router-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear, scaleQuantile, scaleLog, scalePow } from "d3-scale";
import _ from 'lodash'

import StateModel from "../models/StateModel.js"
import CountyModel from "../models/CountyModel.js"
import AreaModel from "../models/AreaModel.js"
import "./USAMap.css"
import {safeSmartNumPlaces} from "../helpers/chartHelpers.js"

//TODO: dont use url, just hardcode! but how to load into Geographies..
const countiesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";
const statesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
// const allowableFields = ['positive', 'total', 'negative', 'posPerc', 'death', 'hospitalized']

function USAMap(props) {
  const history = useHistory();
  const perMillion = props.basis === "per-1m"

  let areas, geoUrl, areaFindF, clickedAreaF;
  switch(props.granularity) {
    case "county":
      geoUrl = countiesGeoUrl; 
      areas = props.counties
      areaFindF = geo => CountyModel.findByFips(parseInt(geo.id))
      clickedAreaF = (county) => history.push("/states/" + county.state.abbreviation)
      break
    case "state":
      geoUrl = statesGeoUrl;
      areas = props.states
      areaFindF = geo => StateModel.findByName(geo.properties.name)
      //TODO: where are the route helpers?
      clickedAreaF = (state) => history.push("/states/" + state.abbreviation)
      break
    default:
      throw new TypeError("error, unknown granularity")
  }

  let max = AreaModel.fieldMax(areas, props.field, perMillion)

  let colorF;
  switch(props.colorScale) {
    case 'linear':
      colorF = scaleLinear([0, max], [
        "white",
        "red",
      ]);
      break;
    case 'quantile':
      //TODO: these dont use the same colors as above. also not sure why anyone would want quantile?
      colorF = scaleQuantile([0,max], [
        "#ffffff",
        "#ffcec5",
        "#ffad9f",
        "#ff8a75",
        "#ff5533",
        "#e2492d",
        "#be3d26",
        "#9a311f",
        "#782618",
        "#651318",
      ]);
      break;
    case 'log2':
      colorF = scaleLog().base(2).domain([1,max]).range([
        "white",
        "red",
      ]);
      break;
    case 'sqrt':
      colorF = scalePow().exponent(0.5).domain([0,max]).range([
        "white",
        "red",
      ]);
      break;
    default:
      throw new TypeError(`error, unknown colorScale ${props.colorScale}`)
  }

  return (
    <ComposableMap data-tip="" projection="geoAlbersUsa">
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map(geo => {
            let color = "#BBBBBB", value = null, tooltip = ""

            let area = areaFindF(geo)

            if(area) {
              //TODO: handle if area doesn't have population data.
              const perCapitaEntries = perMillion ? area.scaledPerMillion() : area.entries
              value = _.last(perCapitaEntries)[props.field]
              if(_.isFinite(value)) { color = colorF(value || 1) }
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
        }
      </Geographies>
    </ComposableMap>
  );
}

const mapStateToProps = (state, ownProps) => ({
  states: state.states,
  counties: state.counties
})

//proptypes: states, counties, granularity, field, basis, scale

export default connect(mapStateToProps)(USAMap)
