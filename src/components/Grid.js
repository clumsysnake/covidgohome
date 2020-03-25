import React from "react"
import _ from 'lodash'
import PropTypes from 'prop-types';

import StateModel from '../models/StateModel.js'
import RegionModel from '../models/RegionModel.js'
import AreaModel from '../models/AreaModel.js'
import DailyChart from './DailyChart.js'
import CumulativeChart from './CumulativeChart.js'
import Group from './Group.js'

const COVIDTRACKING_STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
// const COVIDTRACKING_USDAILY_URL = "https://covidtracking.com/api/us/daily"
//const COVIDTRACKING_STATESCURRENT_URL = "https://covidtracking.com/api/states"

const DOMAIN_MAX_STEPS = 5 //CRZ: give a certain OOM, how many possible domain maxes 

const DEBUG_MAX_STATES = 1000 //CRZ: set lower to limit # of states fetched

class Grid extends React.Component {
  constructor(props) {
    super(props)

    this.state = {states: [], regions: []}

    this.fetchJson(COVIDTRACKING_STATESDAILY_URL, (e) => {
      let json = e.target.response

      let groups = _.groupBy(json, 'state')
      let states = Object.entries(groups).slice(0, DEBUG_MAX_STATES).map((statePair) => {
        //first entry is latest, so reverse
        let entries = statePair[1].reverse()

        return new StateModel({
          name: statePair[0],
          entries,
        })
      })

      let regions = Object.entries(RegionModel.RegionMap).map(pair => {
        return new RegionModel(pair[0], pair[1])
      })

      this.setState({states: states, regions: regions})
    })
  }

  fetchJson(url, onload) {
    let oReq = new XMLHttpRequest();
    oReq.onload = onload
    oReq.open("GET", url);
    oReq.responseType = "json";
    oReq.send();
  }

  sortFunction(sort) {
    switch(sort) {
      case "alpha":
        return (a, b) => (a.code < b.code) ? -1 : 1
      case "percent-confirmed":
        return (a, b) => (a.stats.perTotalConfirmed > b.stats.perTotalConfirmed) ? -1 : 1
      case "most-tests":
        return (a, b) => (a.stats.totalTests > b.stats.totalTests) ? -1 : 1
      default:
        return undefined //TODO
    }
  }

  //TODO: this calculation seems overwrought and needs tests
  domainMax(areas) {
    let field = (this.props.chartType === "daily") ? 'posNegDelta' : 'total'
    let max = AreaModel.fieldMax(areas, field)

    const baseOoms = Math.floor(Math.log10(max))
    const baseDomain = Math.pow(10, baseOoms)
    const increment = baseDomain * 10/DOMAIN_MAX_STEPS
    const domainMax =  Math.ceil(max / increment) * increment
    return domainMax
  }

  render() {
    let sort = this.props.sort
    let comps = []

    let chartForArea = (a, max) => {
      if(this.props.chartType === "daily") {
        return <DailyChart key={a.name} name={a.name} series={a.entries} stats={a.stats} domainMax={max} />
      } else {
        return <CumulativeChart key={a.name} name={a.name} series={a.entries} domainMax={max} />
      }
    }

    if(this.props.aggregate === "region") {
      let areas = RegionModel.all.map((r) => r.createAggregate())
      areas.push(AreaModel.createAggregate('Other', StateModel.withoutRegion))
      areas.sort(this.sortFunction(sort))

      let max = this.domainMax(areas)
      comps = areas.map(a => chartForArea(a, max))
    } else if(this.props.aggregate === "country") {
      let areas = [AreaModel.createAggregate('USA', StateModel.all)]
      let max = this.domainMax(areas)
      comps = areas.map(a => chartForArea(a, max))
    } else if(this.props.group === "region") {
      //CRZ: intentionally setting maxes different for different regions

      let regionComps = RegionModel.all.map(r => {
        let max = this.domainMax(r.states)
        return <Group key={r.name} name={r.name} children={
          r.states.sort(this.sortFunction(sort)).map(s => { return chartForArea(s, max) })
        } />
      })

      let unregionedStates = StateModel.withoutRegion.sort(this.sortFunction(sort))
      let max = this.domainMax(unregionedStates)
      let unregionedComps = unregionedStates.map((s) => { return chartForArea(s, max) })

      comps.push(regionComps, <Group key="Other" name="Other" children={unregionedComps} />)
    } else {
      let areas = this.state.states.sort(this.sortFunction(sort))
      let max = this.domainMax(areas)
      comps = areas.map(a => chartForArea(a, max))
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
  domainMax: PropTypes.number
}
Grid.defaultProps = {
  sort: "most-tests",
  group: "none",
  aggregate: "none",
  chartType: "daily"
}
export default Grid
