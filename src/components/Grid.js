import React from "react"
import {connect} from "react-redux"
import { Link} from 'react-router-dom'
import PropTypes from 'prop-types';

import M from '../models.js'
import CombinedChart from './CombinedChart.js'
import DailyNewPositivesChart from './DailyNewPositivesChart.js'

const DOMAIN_MAX_STEPS = 20 //CRZ: give a certain OOM, how many possible domain maxes 

function Grid(props) {
  function sortFunction(sort) {
    switch(sort) {
      case "alpha":
        return (a, b) => (a.code < b.code) ? -1 : 1
      case "most-cases":
        return (a, b) => {
          return ((a.series.last && a.series.last.positives) > (b.series.last && b.series.last.positives)) ? -1 : 1
        }
      case "most-tests":
        return (a, b) => {
          return ((a.series.last && a.series.last.results) > (b.series.last && b.series.last.results)) ? -1 : 1
        }
      default:
        return undefined //TODO
    }
  }

  let sort = props.sort
  let states = props.states
  let comps = []

  let chartForArea = (a, yDomain, xDomain) => {
    let chartTransform
    switch(props.basis) {
      case 'total': chartTransform = a.series.transform(); break
      case 'per-1m': chartTransform = a.perMillionTransform(); break
      default: break; //TODO: catch error
    }

    // TODO: using abbreviation to check if its a state
    let nameComp = <span className="name">
        {(a.abbreviation) ? <Link to={`/states/${a.abbreviation}`}>{a.name}</Link> : a.name}
      </span>

    switch(props.chartType) {
      case "daily": 
        chartTransform = chartTransform.deltize()
        //fallthru
      case "cumulative":
        return <CombinedChart
          key={a.name}
          name={nameComp}
          data={chartTransform.frames}
          totals={a.series.last}
          yDomain={yDomain}
          xDomain={xDomain}
        />
      case "daily-new-cases":
        chartTransform = chartTransform.deltize()
        return <DailyNewPositivesChart
          key={a.name}
          name={nameComp}
          data={chartTransform.frames}
          totals={a.series.last}
          yDomain={yDomain}
          xDomain={xDomain}
        />
      default: throw new TypeError('unknown chartType')
    }
  }

  //TODO: this calculation seems overwrought and needs tests
  let yDomain = (areas) => {
    if(!props.scaleMatching) {
      return ['auto', 'auto']
    }

    console.log('warning: need to fix yDomain')
    return ['auto', 'auto']

    // let field = (props.chartType === "daily") ? 'posNegDelta' : 'total'
    // let max = M.AreaModel.fieldMax(areas, field, 'per-1m')

    // const baseOoms = Math.floor(Math.log10(max))
    // const baseDomain = Math.pow(10, baseOoms)
    // const increment = baseDomain * 10/DOMAIN_MAX_STEPS
    // const domainMax =  Math.ceil(max / increment) * increment

    // return [0,domainMax]
  }

  let xDomain = (areas) => {
    return [M.AreaModel.fieldMin(areas, 'date'), M.AreaModel.fieldMax(areas, 'date')]
  }

  let compsForAreas = (areas) => {
    let yD = yDomain(areas)
    let xD = xDomain(areas)
    return areas.map(a => chartForArea(a, yD, xD))
  }

  //TODO: refactor. its the group filter that makes it not clean atm.
  if(props.aggregate === "country") {
    comps = compsForAreas([M.AreaModel.createAggregate('USA', states)])
  } else {
    comps = compsForAreas(states.sort(sortFunction(sort)))
  }

  return <div className="grid">
    {states.length ? comps : "loading..."}
  </div>
}

Grid.propTypes = {
  states: PropTypes.array,
  group: PropTypes.string,
  sort: PropTypes.string,
  aggregate: PropTypes.string,
  chartType: PropTypes.string,
  scale: PropTypes.string,
  domainMax: PropTypes.number,
  scaleMatching: PropTypes.bool
}
Grid.defaultProps = {
  states: [],
  sort: "most-tests",
  group: "none",
  aggregate: "none",
  chartType: "daily",
  scale: "total",
  scaleMatching: true
}

const mapStateToProps = (state, ownProps) => ({
  states: state.states
})

export default connect(mapStateToProps)(Grid)
