import React from "react"
import PropTypes from 'prop-types';

import StateModel from '../models/StateModel.js'
import RegionModel from '../models/RegionModel.js'
import AreaModel from '../models/AreaModel.js'
import DailyChart from './DailyChart.js'
import CumulativeChart from './CumulativeChart.js'
import Group from './Group.js'
import { fetchStates } from '../stores/CovidTrackingStore.js'

const DOMAIN_MAX_STEPS = 5 //CRZ: give a certain OOM, how many possible domain maxes 

class Grid extends React.Component {
  constructor(props) {
    super(props)

    this.state = {states: [], regions: RegionModel.all}

    fetchStates((states) => { this.setState({states: states}) })
  }

  sortFunction(sort) {
    switch(sort) {
      case "alpha":
        return (a, b) => (a.code < b.code) ? -1 : 1
      case "percent-confirmed":
        return (a, b) => (a.totals.perConfirmed > b.totals.perConfirmed) ? -1 : 1
      case "most-tests":
        return (a, b) => (a.totals.tests > b.totals.tests) ? -1 : 1
      default:
        return undefined //TODO
    }
  }

  render() {
    let sort = this.props.sort
    let comps = []

    let chartForArea = (a, yDomain, xDomain) => {
      const ProperChart = (this.props.chartType === "daily") ? DailyChart : CumulativeChart
      const scaledSeries = (this.props.basis === "absolute") ? a.entries : a.scaledPerMillion()

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
      let field = (this.props.chartType === "daily") ? 'posNegDelta' : 'total'
      let perMillion = !(this.props.basis === "absolute")
      let max = AreaModel.fieldMax(areas, field, perMillion)

      console.log(`perMillion: ${perMillion}, max: ${max}`)

      const baseOoms = Math.floor(Math.log10(max))
      const baseDomain = Math.pow(10, baseOoms)
      const increment = baseDomain * 10/DOMAIN_MAX_STEPS
      const domainMax =  Math.ceil(max / increment) * increment

      console.log(`domainMax: ${domainMax}`)

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

    //TODO: refactor. its the group filter that makes it not clean atm.
    if(this.props.aggregate === "region") {
      let areas = RegionModel.all.map((r) => r.createAggregate())
      areas.push(AreaModel.createAggregate('Other', StateModel.withoutRegion))
      areas.sort(this.sortFunction(sort))
      comps = compsForAreas(areas)
    } else if(this.props.aggregate === "country") {
      comps = compsForAreas([AreaModel.createAggregate('USA', StateModel.all)])
    } else if(this.props.group === "region") {
      //CRZ: intentionally setting maxes different for different regions
      let regionGroups = RegionModel.all.map(r => {
        return <Group key={r.name} name={r.name} children={
          compsForAreas(r.states.sort(this.sortFunction(sort)))
        } />
      })

      let unregionedComps = compsForAreas(StateModel.withoutRegion.sort(this.sortFunction(sort)))
      let unregionedGroup = <Group key="Other" name="Other" children={unregionedComps} />

      comps.push(regionGroups, unregionedGroup)
    } else {
      comps = compsForAreas(this.state.states.sort(this.sortFunction(sort)))
    }

    return <div className="grid">
      {StateModel.all.length ? comps : "loading..."}
    </div>
  }
}

Grid.propTypes = {
  group: PropTypes.string,
  sort: PropTypes.string,
  aggregate: PropTypes.string,
  chartType: PropTypes.string,
  scale: PropTypes.string,
  domainMax: PropTypes.number
}
Grid.defaultProps = {
  sort: "most-tests",
  group: "none",
  aggregate: "none",
  chartType: "daily",
  scale: "absolute"
}
export default Grid
