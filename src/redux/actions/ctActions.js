import _ from 'lodash'
import moment from 'moment'

import * as types from '../types'
import store from '../store'
import { censusDataForAbbrev } from '../../stores/CensusStore'
import StateModel from '../../models/StateModel'
import { fetchJson } from './helpers'

const STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
//const USDAILY_URL = "https://covidtracking.com/api/us/daily"
//const STATESCURRENT_URL = "https://covidtracking.com/api/states"
// const NON_STATE_PROBLEMS = ['AS', 'GU', 'MP', 'VI']
// const NON_STATE_OKAY = ['DC']

const DEBUG_MAX_STATES = 1000 //CRZ: set lower to limit # of states fetched

const statesDailyUrl = function() {
  if(process.env.NODE_ENV === 'development') {
    return "http://localhost:3000/ct.statesdaily.cache.json"
  } else {
    return STATESDAILY_URL
  }
}

const ctDateParse = function(string) {
  return moment(string, 'YYYYMMDD').unix()
}

function fetchStatesDaily() {
  fetchJson(statesDailyUrl(), (e) => {
    let json = e.target.response
    store.dispatch(handleStatesDaily(json))
  })

  return {
    type: types.COVIDTRACKING_FETCH_STATES
  };
}

function handleStatesDaily(json) {
  let groups = _.groupBy(json, 'state')
  let states = Object.entries(groups).slice(0, DEBUG_MAX_STATES).map((statePair) => {
    //first entry is latest, so reverse
    let entries = statePair[1].reverse()
    let abbrev = statePair[0]
    let censusData = censusDataForAbbrev(abbrev)

    if(!censusData) { console.log(`couldnt find census data for state abbrev ${abbrev}`); }

    entries.forEach(e => e.date = ctDateParse(e.date))

    //TODO: add census density (so i can calculate total area from that?)
    return new StateModel({abbrev: abbrev, entries, population: censusData && censusData.population})
  })

  return {
    type: types.COVIDTRACKING_HANDLE_STATES,
    states: states
  };
}

export default { fetchStatesDaily }