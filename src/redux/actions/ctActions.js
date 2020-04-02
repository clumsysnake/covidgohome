import _ from 'lodash'
import moment from 'moment'

import * as types from '../types'
import store from '../store'
import { censusDataForAbbrev } from '../../stores/CensusStore'
import StateModel from '../../models/StateModel'
import AreaModel from '../../models/AreaModel'
import { fetchXhr } from './helpers'

const STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
const STATESCURRENT_URL = "https://covidtracking.com/api/states"
//const USDAILY_URL = "https://covidtracking.com/api/us/daily"
// const NON_STATE_PROBLEMS = ['AS', 'GU', 'MP', 'VI']
// const NON_STATE_OKAY = ['DC']

const DEBUG_MAX_STATES = 1000 //CRZ: set lower to limit # of states fetched

const statesDailyUrl = function() {
  return (process.env.NODE_ENV === 'development') ? "http://localhost:3000/ct.statesdaily.cache.json" : STATESDAILY_URL
}

const statesCurrentUrl = function() {
  return (process.env.NODE_ENV === 'development') ? "http://localhost:3000/ct.statescurrent.cache.json" : STATESCURRENT_URL
}

const dateParse = function(string) {
  return moment(string, 'YYYYMMDD').unix()
}

function fetchStatesDaily() {
  fetchXhr(statesDailyUrl(), (e) => {
    let json = e.target.response
    store.dispatch(handleStatesDaily(json))
  })

  return {
    type: types.COVIDTRACKING_FETCH_STATES_DAILY
  };
}

function handleStatesDaily(json) {
  let groups = _.groupBy(json, 'state')
  
  Object.entries(groups).slice(0, DEBUG_MAX_STATES).map((statePair) => {
    //first entry is latest, so reverse
    let entries = statePair[1].reverse()
    let abbrev = statePair[0]
    let censusData = censusDataForAbbrev(abbrev)

    if(!censusData) { console.log(`couldnt find census data for state abbrev ${abbrev}`); }

    entries.forEach(e => e.date = dateParse(e.date))

    //TODO: add census density (so i can calculate total area from that?)
    return new StateModel({abbrev: abbrev, entries, population: censusData && censusData.population})
  })

  store.dispatch(fetchStatesCurrent(json))

  return {
    type: types.COVIDTRACKING_HANDLE_STATES_DAILY,
    json: json,
    states: [] //CRZ: let handleStatesCurrent update states so it does it only once
  };
}

function fetchStatesCurrent() {
  fetchXhr(statesCurrentUrl(), (e) => {
    let json = e.target.response
    store.dispatch(handleStatesCurrent(json))
  })

  return {
    type: types.COVIDTRACKING_FETCH_STATES_CURRENT
  };
}

//Really dont know how to reconcile the data based on timestamps... the feeds dont seem coordinated.
//So for now, if all the fields are the same, then dont add a new entry. If anything has changed since last, add a new one.
//Also unsure what date to really be using here...basically just incrementing one from the last entry.
function handleStatesCurrent(json) {
  json.map((x) => {
    const state = StateModel.findByAbbrev(x.state)
    if(!state) {
      console.log(`Somehow couldnt find state for ${x.state}`)
      return null
    }

    //if there is a matching entry, statecurrent has no new entries
    if(state.findMatchingEntry(x)) { return null }

    //otherwise there is a new entry to be added. areamodel will calculate date and increase fields
    // debugger
    state.addEntryFromPrimaries(AreaModel.primaryStats.reduce((h, k) => Object.assign(h, {[k]: x[k]}), {}))

    return state
  }, [])


  //TODO: i should return ONLY updateStates, but not sure how to reduce that properly. just refresh all for now.
  return {
    type: types.COVIDTRACKING_HANDLE_STATES_CURRENT,
    json: json,
    updatedStates: StateModel.all
  };
}

export default { fetchStatesDaily, fetchStatesCurrent }