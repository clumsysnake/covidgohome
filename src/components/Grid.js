import React from "react"
import {connect} from "react-redux"
import { Link} from 'react-router-dom'
import PropTypes from 'prop-types';

import RegionModel from '../models/RegionModel.js'
import AreaModel from '../models/AreaModel.js'
import CombinedChart from './CombinedChart.js'
import DailyNewPositivesChart from './DailyNewPositivesChart.js'
import Group from './Group.js'

const DOMAIN_MAX_STEPS = 20 //CRZ: give a certain OOM, how many possible domain maxes 

class Grid extends React.Component {
  sortFunction(sort) {
    switch(sort) {
      case "alpha":
        return (a, b) => (a.code < b.code) ? -1 : 1
      case "most-cases":
        return (a, b) => {
          return (a.series.last && a.series.last.positives > b.series.last && b.series.last.positives) ? -1 : 1
        }
      case "most-tests":
        return (a, b) => {
          return (a.series.last && a.series.last.results > b.series.last && b.series.last.results) ? -1 : 1
        }
      default:
        return undefined //TODO
    }
  }

  render() {
    let sort = this.props.sort
    let states = this.props.states
    let comps = []

    let chartForArea = (a, yDomain, xDomain) => {
      let chartTransform
      switch(this.props.basis) {
        case 'total': chartTransform = a.series.transform; break
        case 'per-1m': chartTransform = a.perMillionTransform(); break
        // case 'percentage': chartData = a.scaledToPercentage(); break
        default: break; //TODO: catch error
      }

      // TODO: using abbreviation to check if its a state
      let nameComp = <span className="name">
          {(a.abbreviation) ? <Link to={`/states/${a.abbreviation}`}>{a.name}</Link> : a.name}
        </span>

      switch(this.props.chartType) {
        case "daily": 
          chartTransform = chartTransform.deltize()
        case "cumulative":
          return <CombinedChart
            key={a.name}
            name={nameComp}
            data={chartTransform.frames}
            totals={a.totals}
            yDomain={yDomain}
            xDomain={xDomain}
          />
        case "daily-new-cases":
          chartTransform = chartTransform.deltize()
          return <DailyNewPositivesChart
            key={a.name}
            name={nameComp}
            data={chartTransform.frames}
            totals={a.totals}
            yDomain={yDomain}
            xDomain={xDomain}
          />
        default: throw new TypeError('unknown chartType')
      }
    }

    //TODO: this calculation seems overwrought and needs tests
    let yDomain = (areas) => {
      console.log('warning: need to fix yDomain')
      return ['auto', 'auto']
      // if(this.props.basis === "percentage") {
      //   return [0, 100]
      // }

      // if(!this.props.scaleMatching) {
      //   return ['auto', 'auto']
      // }

      // let field = (this.props.chartType === "daily") ? 'posNegDelta' : 'total'
      // let max = AreaModel.fieldMax(areas, field, 'per-1m')

      // const baseOoms = Math.floor(Math.log10(max))
      // const baseDomain = Math.pow(10, baseOoms)
      // const increment = baseDomain * 10/DOMAIN_MAX_STEPS
      // const domainMax =  Math.ceil(max / increment) * increment

      // return [0,domainMax]
    }

    let xDomain = (areas) => {
      return [AreaModel.fieldMin(areas, 'date'), AreaModel.fieldMax(areas, 'date')]
    }

    let compsForAreas = (areas) => {
      let yD = yDomain(areas)
      let xD = xDomain(areas)
      return areas.map(a => chartForArea(a, yD, xD))
    }

    let withoutRegion = states.filter(m => m.region === null)

    //TODO: refactor. its the group filter that makes it not clean atm.
    if(this.props.aggregate === "region") {
      let areas = RegionModel.all.map((r) => r.createAggregate())
      areas.push(AreaModel.createAggregate('Other', withoutRegion))
      areas.sort(this.sortFunction(sort))
      comps = compsForAreas(areas)
    } else if(this.props.aggregate === "country") {
      comps = compsForAreas([AreaModel.createAggregate('USA', states)])
    } else if(this.props.group === "region") {
      //CRZ: intentionally setting maxes different for different regions
      let regionGroups = RegionModel.all.map(r => {
        return <Group key={r.name} name={r.name} children={
          compsForAreas(r.states.sort(this.sortFunction(sort)))
        } />
      })

      let unregionedComps = compsForAreas(withoutRegion.sort(this.sortFunction(sort)))
      let unregionedGroup = <Group key="Other" name="Other">{unregionedComps}</Group>

      comps.push(regionGroups, unregionedGroup)
    } else {
      comps = compsForAreas(states.sort(this.sortFunction(sort)))
    }

    return <div className="grid">
      {states.length ? comps : "loading..."}
    </div>
  }
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
