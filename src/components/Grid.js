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
        let entries = this.decorateTimeSeries(statePair[1].reverse()) 
        let stats = this.statsForSeries(entries)

        return new StateModel({
          code: statePair[0],
          entries,
          stats
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

  decorateTimeSeries(entries) {
    entries.forEach((e, idx, a) => {
      e.posNeg = e.positive + e.negative //where total is neg + pos + pending
      e.posNegChange = (idx > 0) ? e.posNeg - a[idx-1].posNeg : null
      e.posChange = (idx > 0) ? e.positive - a[idx-1].positive : null
      e.posPercToday = (idx > 0) ? (e.posChange / e.posNegChange) * 100 : null

      //regularize broken data
      if(e.negative === null && idx > 0) { e.negative = a[idx-1].negative }
    })

    return entries
  }

  statsForSeries(entries) {
    let totalConfirmed = _.last(entries).positive
    let totalTests = _.last(entries).total

    return {
      totalTests,
      totalConfirmed,
      perTotalConfirmed: 100 * (totalConfirmed / totalTests),
      totalDead: _.last(entries).death || 0
    }
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


    if(sort === "region") { //TODO: not technically a sort then!
      let regions = RegionModel.all.map(r => <Region region={r} children={
        r.states.map(state => {
          return <AreaChart key={state.code} name={state.code} series={state.entries} stats={state.stats}/>
        })
      } />)

      let unregionedStates = StateModel.withoutRegion.sort(this.sortFunction('most-tests')).map((state) => {
        return <AreaChart key={state.code} name={state.code} series={state.entries} stats={state.stats}/>
      })

      comps.push(regions, <span className="region-header">Unregioned</span>, unregionedStates)
    } else {
      comps = this.state.states.sort(this.sortFunction(sort)).map((state) => {
        return <AreaChart key={state.code} name={state.code} series={state.entries} stats={state.stats}/>
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
