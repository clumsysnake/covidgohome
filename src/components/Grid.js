import React from "react"
import _ from 'lodash'

import StateModel from '../models/StateModel.js'
import RegionModel from '../models/RegionModel.js'
// import { REGION_MAP } from '../models/StateModel.js'
import AreaChart from './AreaChart.js'
import Region from './Region.js'

const COVIDTRACKING_STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
// const COVIDTRACKING_USDAILY_URL = "https://covidtracking.com/api/us/daily"

const DEBUG_MAX_STATES = 1000 //CRZ: set lower to limit # of states displayed
// const DEBUG_MAX_STATES = 10

class Grid extends React.Component {
  constructor(props) {
    super(props)

    this.state = {states: [], regions: [], usDaily: null}

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

    // this.fetchJson(COVIDTRACKING_USDAILY_URL, function(e) {
    //   let json = e.target.response
    //   t.setState({statesDaily: json})
    // })
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
      case "region":
        return (a, b) => {
          return (((a.region && a.region.name) || "") > ((b.region && b.region.name) || "")) ? -1 : 1
        }
      case "percent-confirmed":
        return (a, b) => (a.stats.perTotalConfirmed > b.stats.perTotalConfirmed) ? -1 : 1
      case "most-tests":
        return (a, b) => (a.stats.totalTests > b.stats.totalTests) ? -1 : 1
      default:
        return undefined //TODO
    }
  }

  sortByMostTests(a, b) {
    return (a.entries[0].total > b.entries[0].total) ? -1 : 1
  }

  render() {
    let sort = this.props.sort
    let comps = []

    let chartForState = (s) => <AreaChart key={s.name} name={s.name} series={s.entries} stats={s.stats}/>

    if(this.props.aggregate === "region") {
      //TODO: memoize aggregate
      comps = RegionModel.all.map((r) => {
        let agg = r.createAggregate();
        return <AreaChart key={r.name} name={r.name} series={agg.entries} stats={agg.stats}/>
      })
    } else if(sort === "region") { //TODO: not technically a sort then! this is a weird conditional
      let regions = RegionModel.all.map(r => <Region key={r.name} region={r} children={
        r.states.map(s => { return chartForState(s) })
      } />)

      let unregionedStates = StateModel.withoutRegion.sort(this.sortFunction('most-tests')).map((s) => {
        return chartForState(s)
      })

      comps.push(regions, <span key="unregioned" className="region-header">Unregioned</span>, unregionedStates)
    } else {
      comps = this.state.states.sort(this.sortFunction(sort)).map((s) => {
        return chartForState(s)
      })
    }

    //TODO: not showing loading
    return <div className="grid">
      {comps.length ? comps : "loading..."}
    </div>
  }
}

Grid.propTypes = {
  // sort
}
Grid.defaultProps = {
  sort: "region"
}
export default Grid
