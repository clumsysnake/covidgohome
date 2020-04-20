import _ from '../lodash.js'
import React from "react";
import PropTypes from "prop-types"

import * as H from '../helpers/chartHelpers'
import M from '../models.js'
import C from '../components.js'
import { projectionForTopo, topologyForCounties } from '../stores/Topologies.js'

//CRZ: choosing to display counties without data as white. I'm not sure if JH
//     just doesn't have data for the counties, or if they choose not to include counties
//     with all zero counts to save space.
const NO_COUNTY_DATA_COLOR = 'white'

function SAMap(props) {
  const perMillion = ["per-1m", "squared-per-1m"].includes(props.basis)

  let areas = props.counties
  let topo = topologyForCounties(areas.map(a => a.fips))

  let areaFindF = geo => M.CountyModel.findByFips(geo.id)
  let max = M.AreaModel.fieldMax(areas, props.field, props.basis)
  let colorF = H.colorScale(props.colorScale, max)
  let projection = projectionForTopo(topo)
  let date = props.date

  //CRZ: TODO: memoize this?
  let geoMappingFunction = geo => {
    let color, tooltip = ""

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
    } else { // no area
      color = "#DDDDDD"
    }

    return {
      onMouseEnter: () => { props.setTooltipContent(tooltip) },
      onMouseLeave: () => { props.setTooltipContent("") },
      style: {
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
      }
    }
  }

  return (
    <C.Map projection={projection} topo={topo} mappingFunction={geoMappingFunction}/>
  )
}

SAMap.propTypes = {
  counties: PropTypes.array,
  date: PropTypes.number,
  setTooltipContent: PropTypes.func,
  field: PropTypes.string,
  basis: PropTypes.string,
  colorScale: PropTypes.string
}

export default SAMap