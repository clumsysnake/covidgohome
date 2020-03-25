import React from "react"
import _ from 'lodash'
import PropTypes from 'prop-types';

import StateModel from '../models/StateModel.js'
import RegionModel from '../models/RegionModel.js'
import AreaModel from '../models/AreaModel.js'
// import { REGION_MAP } from '../models/StateModel.js'
import DailyChart from './DailyChart.js'
import CumulativeChart from './CumulativeChart.js'
import Group from './Group.js'

const COVIDTRACKING_STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
// const COVIDTRACKING_USDAILY_URL = "https://covidtracking.com/api/us/daily"

const DEBUG_MAX_STATES = 1000 //CRZ: set lower to limit # of states displayed
// const DEBUG_MAX_STATES = 10

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

  render() {
    let sort = this.props.sort
    let comps = []

    let chartForArea = (a) => {
      if(this.props.chartType === "daily") {
        return <DailyChart key={a.name} name={a.name} series={a.entries} stats={a.stats} />
      } else {
        return <CumulativeChart key={a.name} name={a.name} series={a.entries} />
      }
    }

    if(this.props.aggregate === "region") {
      let areas = RegionModel.all.map((r) => r.createAggregate())
      areas.push(AreaModel.createAggregate('Other', StateModel.withoutRegion))
      
      areas.sort(this.sortFunction(sort))

      comps = areas.map(a => chartForArea(a))
    } else if(this.props.aggregate === "country") {
      comps = [chartForArea(AreaModel.createAggregate('USA', StateModel.all))]
    } else if(this.props.group === "region") {
      let regions = RegionModel.all.map(r => <Group key={r.name} name={r.name} children={
        r.states.sort(this.sortFunction(sort)).map(s => { return chartForArea(s) })
      } />)

      let unregionedStates = StateModel.withoutRegion.sort(this.sortFunction(sort)).map((s) => {
        return chartForArea(s)
      })

      comps.push(
        regions, 
        <Group key="Other" name="Other" children={unregionedStates} />     
      )
    } else {
      let allStates = this.state.states.sort(this.sortFunction(sort))
      comps = allStates.map((s) => {
        return chartForArea(s)
      })
    }

    //TODO: not showing loading
    return <div className="grid">
      {StateModel.all.length ? comps : "loading..."}
    </div>
  }
}

Grid.propTypes = {
  group: PropTypes.string,
  sort: PropTypes.string,
  aggregate: PropTypes.string,
  chartType: PropTypes.string
}
Grid.defaultProps = {
  sort: "most-tests",
  group: "none",
  aggregate: "none",
  chartType: "daily"
}
export default Grid
