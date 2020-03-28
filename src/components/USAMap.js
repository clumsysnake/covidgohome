import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import StateModel from "../models/StateModel.js"
import AreaModel from "../models/AreaModel.js"
import "./USAMap.css"
import {safeSmartNumPlaces} from "../helpers/chartHelpers.js"

// const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

class USAMap extends React.Component {
  get allowableFields() {
    return ['positive', 'total', 'negative', 'posPerc', 'death', 'hospitalized']
  }

  render() {
    let max = AreaModel.fieldMax(StateModel.all, this.props.field, true)
    const colorScale = scaleQuantile()
      .domain([0, max])
      .range([
        "#ffedea",
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

    return (
      <ComposableMap data-tip="" projection="geoAlbersUsa">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              let color = "#EEE", value = null, tooltip = ""
              let area = StateModel.findByName(geo.properties.name)

              if(area) {
                const perCapitaEntries = area.scaledPerMillion()
                value = perCapitaEntries[perCapitaEntries.length-1][this.props.field]
                color = colorScale(value)
                tooltip = `${area.name} -- ${safeSmartNumPlaces(value, 1)} ${this.props.field}s per million people`
              } else {
                tooltip = "unknown" //TODO: can still show area counts
              }

              return <Geography
                key={geo.rsmKey}
                geography={geo}
                onMouseEnter={() => { this.props.setTooltipContent(tooltip) }}
                onMouseLeave={() => { this.props.setTooltipContent("") }}
                // onClick={clickedMe}
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
};

export default USAMap;