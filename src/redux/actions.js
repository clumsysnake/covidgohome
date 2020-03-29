import _ from 'lodash'
import { censusDataForAbbrev } from '../stores/CensusStore.js'

import StateModel from '../models/StateModel.js'
import * as types from '../redux/types.js'

import store from '../redux/store'

const COVIDTRACKING_STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
//const COVIDTRACKING_USDAILY_URL = "https://covidtracking.com/api/us/daily"
//const COVIDTRACKING_STATESCURRENT_URL = "https://covidtracking.com/api/states"

const NON_STATE_PROBLEMS = ['AS', 'GU', 'MP', 'VI']
const NON_STATE_OKAY = ['DC']

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

export function fetchStates() {
  fetchJson(statesDailyUrl(), (e) => {
    let json = e.target.response
    store.dispatch(handleFetchStates(json))
  })

  return {
    type: types.COVIDTRACKING_FETCH_STATES
  };
}

export function handleFetchStates(json) {
  let groups = _.groupBy(json, 'state')
  let states = Object.entries(groups).slice(0, DEBUG_MAX_STATES).map((statePair) => {
    //first entry is latest, so reverse
    let entries = statePair[1].reverse()
    let abbrev = statePair[0]
    let censusData = censusDataForAbbrev(abbrev)

    if(!censusData) { console.log(`couldnt find census data for state abbrev ${abbrev}`); }

    //TODO: add census density
    return new StateModel({abbrev: abbrev, entries, population: censusData && censusData.population})
  })

  //TODO: can't return statemodel can i?

  return {
    type: types.COVIDTRACKING_HANDLE_FETCHED_STATES,
    states: states
  };
}
