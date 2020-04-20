import React from "react";
import {connect} from "react-redux"
import { useHistory } from "react-router-dom";
import _ from '../lodash.js'

import { countiesGeoUrl, statesGeoUrl } from '../stores/Topologies.js'
import * as H from '../helpers/chartHelpers'
import M from '../models.js'
import C from '../components.js'
import "./USAMap.css"

//CRZ: choosing to display counties with null fields as white. this is because I
//     am assuming that JH is not listing counties when they have count=0.
//     If the counts were unknown, i would use a grey. grey is unknown, white is 0.
const NO_COUNTY_DATA_COLOR = 'white'
const UNKNOWN_AREA_COLOR = "#BBBBBB"

function USAMap(props) {
  const history = useHistory();
  const perMillion = ["per-1m", "squared-per-1m"].includes(props.basis)
  const field = props.field

  let areas, geoUrl, areaFindF, clickedAreaF;
  switch(props.granularity) {
    case "county":
      geoUrl = countiesGeoUrl; 
      areas = props.counties
      areaFindF = geo => M.CountyModel.findByFips(geo.id)
      clickedAreaF = (county) => history.push("/states/" + county.state.abbreviation)
      break
    case "state":
      geoUrl = statesGeoUrl;
      areas = props.states
      areaFindF = geo => M.StateModel.findByName(geo.properties.name)
      clickedAreaF = (state) => history.push("/states/" + state.abbreviation)
      break
    default:
      throw new TypeError("error, unknown granularity")
  }

  let max = M.AreaModel.fieldMax(areas, field, props.basis)
  let colorF = H.colorScale(props.colorScale, max)
  let date = props.date || M.AreaModel.findMostRecentCommonFrameDate(areas)

  let mappingFunction = geo => {
    let color, tooltip
    let area = areaFindF(geo)

    if(area && area.frames && area.frameForDate(date)) {
      let [tooltipTransform, transform] = H.basisTransforms(area, props.basis)
      let value = transform.frameForDate(date)[props.field]
      let tooltipValue = tooltipTransform.frameForDate(date)[props.field]
      color = (_.isFinite(value)) ? color = colorF(value) : NO_COUNTY_DATA_COLOR
      tooltip = `${area.name} -- ${H.safeSmartNumPlaces(tooltipValue || 0, 1)} ${field}`
      if(perMillion) { tooltip += " per million people" }
    } else if(area) {
      color = NO_COUNTY_DATA_COLOR
      tooltip = area.name
    } else {
       color = UNKNOWN_AREA_COLOR
       tooltip = "unknown area"
    }

    return {
      onMouseEnter: () => { props.setTooltipContent(tooltip) },
      onMouseLeave: () => { props.setTooltipContent("") },
      onClick: () => { clickedAreaF(area) },
      style: {
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
      }
    }
  }

  return <C.Map projection="geoAlbersUsa" topo={geoUrl} mappingFunction={mappingFunction}/>
}

const mapStateToProps = (state, ownProps) => ({
  states: state.states,
  counties: state.counties
})

//proptypes: states, counties, granularity, field, basis, scale
USAMap.defaultProps = {
}

export default connect(mapStateToProps)(USAMap)
