import React from "react"
import _ from 'lodash'

import USState from './USState.js'

const COVIDTRACKING_STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
const COVIDTRACKING_USDAILY_URL = "https://covidtracking.com/api/us/daily"

const DEBUG_MAX_STATES = 1000 //CRZ: set lower to limit # of states displayed
// const DEBUG_MAX_STATES = 5 

class Grid extends React.Component {
  constructor(props) {
    super(props)

    this.state = {statesDaily: null, usDaily: null}

    this.fetchJson(COVIDTRACKING_STATESDAILY_URL, 'statesDaily')
    this.fetchJson(COVIDTRACKING_USDAILY_URL, 'usDaily')
  }

  fetchJson(url, stateKey) {
    let t = this;

    let oReq = new XMLHttpRequest();
    oReq.onload = function(e) {
      t.setState({[stateKey]: e.target.response});
    }
    oReq.open("GET", url);
    oReq.responseType = "json";
    oReq.send();
  }

  decorateTimeSeries(entries) {
    return entries.map((e, idx, a) => {
      e.posNeg = e.positive + e.negative //where total is neg + pos + pending
      e.posNegChange = (idx > 0) ? e.posNeg - a[idx-1].posNeg : null
      e.posChange = (idx > 0) ? e.positive - a[idx-1].positive : null
      e.posPercToday = (idx > 0) ? (e.posChange / e.posNegChange) * 100 : null

      //regularize broken data
      if(e.negative === null && idx > 0) { e.negative = a[idx-1].negative }

      return e
    })
  }

  sortByMostTests(pairA, pairB) {
    return (pairA[1][0].total > pairB[1][0].total) ? -1 : 1
  }

  render() {
    let groups = _.groupBy(this.state.statesDaily, 'state')

    let globalXDates = _.uniq(
      Object.entries(groups).flatMap((pair) => {
        return pair[1].map(date => date)
      })
    ).sort()
    let globalXDomain = [globalXDates[0], globalXDates[globalXDates.length-1]]
    // console.log(globalXDomain)

    let states = Object.entries(groups)
      .slice(0, DEBUG_MAX_STATES)
      .sort(this.sortByMostTests)

    // console.log(states);

    let stateComps = states.map((pair) => {
      let entries = this.decorateTimeSeries(pair[1].reverse() )
      // console.log(this.decorateTimeSeries(pair[1]))
      return <USState key={pair[0]} entries={entries} globalXDomain={globalXDomain}/>
    })


    return <div className="grid">
      {stateComps.length ? stateComps : "loading..."}
    </div>
  }
}

Grid.propTypes = {}
Grid.defaultProps = {}
export default Grid
