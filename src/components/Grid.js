import React from "react"
import _ from 'lodash'

import StateModel from '../models/StateModel.js'
import RegionModel from '../models/RegionModel.js'
// import { REGION_MAP } from '../models/StateModel.js'
import USState from './USState.js'

const COVIDTRACKING_STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
// const COVIDTRACKING_USDAILY_URL = "https://covidtracking.com/api/us/daily"

const DEBUG_MAX_STATES = 1000 //CRZ: set lower to limit # of states displayed
// const DEBUG_MAX_STATES = 10

class Grid extends React.Component {
  constructor(props) {
    super(props)

    this.state = {states: [], regions: [], usDaily: null}

    let t = this
    this.fetchJson(COVIDTRACKING_STATESDAILY_URL, function(e) {
      let json = e.target.response

      let groups = _.groupBy(json, 'state')
      let states = Object.entries(groups).slice(0, DEBUG_MAX_STATES).map((statePair) => {
        //first entry is latest, so reverse
        let entries = t.decorateTimeSeries(statePair[1].reverse()) 
        let totalConfirmed = _.last(entries).positive
        let totalTests = _.last(entries).total

        return new StateModel({
          code: statePair[0],
          entries,
          totalTests,
          totalConfirmed,
          perTotalConfirmed: 100 * (totalConfirmed / totalTests),
          totalDead: _.last(entries).death || 0
        })
      })

      let regions = Object.entries(RegionModel.RegionMap).map(pair => {
        return new RegionModel(pair[0], pair[1])
      })

      t.setState({states: states, regions: regions})
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

  sortFunction(sort) {
    switch(sort) {
      case "alpha":
        return (a, b) => (a.code < b.code) ? -1 : 1
      case "region":
        return (a, b) => {
          return (((a.region && a.region.name) || "") > ((b.region && b.region.name) || "")) ? -1 : 1
        }
      case "percent-confirmed":
        return (a, b) => (a.perTotalConfirmed > b.perTotalConfirmed) ? -1 : 1
      case "most-tests":
        return (a, b) => (a.totalTests > b.totalTests) ? -1 : 1
      default:
        return undefined //TODO
    }
  }

  sortByMostTests(a, b) {
    return (a.entries[0].total > b.entries[0].total) ? -1 : 1
  }

  render() {
    debugger

    let stateComps = this.state.states.sort(this.sortFunction(this.props.sort)).map((state) => {
      return <USState key={state.code} state={state}/>
    })

    return <div className="grid">
      {stateComps.length ? stateComps : "loading..."}
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
