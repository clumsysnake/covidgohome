import React from "react"
import {connect} from "react-redux"
import PropTypes from 'prop-types';

import RegionModel from '../models/RegionModel.js'
import AreaModel from '../models/AreaModel.js'
import DailyChart from './DailyChart.js'
import CumulativeChart from './CumulativeChart.js'
import Group from './Group.js'

const DOMAIN_MAX_STEPS = 20 //CRZ: give a certain OOM, how many possible domain maxes 

class Grid extends React.Component {
  constructor(props) {
    super(props)

    this.state = {regions: RegionModel.all}
  }

  sortFunction(sort) {
    switch(sort) {
      case "alpha":
        return (a, b) => (a.code < b.code) ? -1 : 1
      case "percent-positive":
        return (a, b) => (a.totals.perPositive > b.totals.perPositive) ? -1 : 1
      case "most-tests":
        return (a, b) => (a.totals.total > b.totals.total) ? -1 : 1
      default:
        return undefined //TODO
    }
  }

  render() {
    let sort = this.props.sort
    let states = this.props.states
    let comps = []

    let chartForArea = (a, yDomain, xDomain) => {
      const ProperChart = (this.props.chartType === "daily") ? DailyChart : CumulativeChart
      let scaledSeries = null;

      switch(this.props.basis) {
        case 'absolute': scaledSeries = a.entries; break
        case 'per-1m': scaledSeries = a.scaledPerMillion(); break
        case 'percentage': scaledSeries = a.scaledToPercentage(); break
        default: break; //TODO: catch error
      }

      return <ProperChart 
        key={a.name}
        name={a.name}
        series={scaledSeries}
        totals={a.totals}
        yDomain={yDomain}
        xDomain={xDomain}
      />
    }

    //TODO: this calculation seems overwrought and needs tests
    let yDomain = (areas) => {
      if(this.props.basis === "percentage") {
        return [0, 100]
      }

      if(!this.props.scaleMatching) {
        return ['auto', 'auto']
      }

      let field = (this.props.chartType === "daily") ? 'posNegDelta' : 'total'
      let perMillion = !(this.props.basis === "absolute")
      let max = AreaModel.fieldMax(areas, field, perMillion)

      const baseOoms = Math.floor(Math.log10(max))
      const baseDomain = Math.pow(10, baseOoms)
      const increment = baseDomain * 10/DOMAIN_MAX_STEPS
      const domainMax =  Math.ceil(max / increment) * increment

      return [0,domainMax]
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
  scale: "absolute",
  scaleMatching: true
}

const mapStateToProps = (state, ownProps) => ({
  states: state.states
})

export default connect(mapStateToProps)(Grid)
