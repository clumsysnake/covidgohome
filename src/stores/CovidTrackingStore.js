import _ from 'lodash'
import { censusDataForAbbrev } from '../stores/CensusStore.js'
import StateModel from '../models/StateModel.js'

const COVIDTRACKING_STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
//const COVIDTRACKING_USDAILY_URL = "https://covidtracking.com/api/us/daily"
//const COVIDTRACKING_STATESCURRENT_URL = "https://covidtracking.com/api/states"

const DEBUG_MAX_STATES = 1000 //CRZ: set lower to limit # of states fetched

const statesDailyUrl = function() {
  if(process.env.NODE_ENV === 'development') {
    return "http://localhost:3000/statesdaily.cache.json"
  } else {
    return COVIDTRACKING_STATESDAILY_URL
  }
}

const fetchJson = function(url, onload) {
  let oReq = new XMLHttpRequest();
  oReq.onload = onload
  oReq.open("GET", url);
  oReq.responseType = "json";
  oReq.send();
}

const fetchStates = function(then) {
  fetchJson(statesDailyUrl(), (e) => {
    let json = e.target.response

    let groups = _.groupBy(json, 'state')
    let states = Object.entries(groups).slice(0, DEBUG_MAX_STATES).map((statePair) => {
      //first entry is latest, so reverse
      let entries = statePair[1].reverse()
      let abbrev = statePair[0]
      let censusData = censusDataForAbbrev(abbrev)

      if(!censusData) { console.log(`couldnt find census data for state abbrev ${abbrev}`); }

      //TODO: add census density
      return new StateModel({name: abbrev, entries, population: censusData && censusData.population})
    })

    then(states)
  })
}

export { fetchStates }