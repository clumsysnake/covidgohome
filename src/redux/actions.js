import _ from 'lodash'
import Papa from 'papaparse'

import * as types from '../redux/types.js'
import store from '../redux/store'

import { censusDataForAbbrev, censusDataForFips } from '../stores/CensusStore.js'
import StateModel from '../models/StateModel.js'
import CountyModel from '../models/CountyModel.js'

const COVIDTRACKING_STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
//const COVIDTRACKING_USDAILY_URL = "https://covidtracking.com/api/us/daily"
//const COVIDTRACKING_STATESCURRENT_URL = "https://covidtracking.com/api/states"

// const NON_STATE_PROBLEMS = ['AS', 'GU', 'MP', 'VI']
// const NON_STATE_OKAY = ['DC']

const DEBUG_MAX_STATES = 1000 //CRZ: set lower to limit # of states fetched

const statesDailyUrl = function() {
  if(process.env.NODE_ENV === 'development') {
    return "http://localhost:3000/statesdaily.cache.json"
  } else {
    return COVIDTRACKING_STATESDAILY_URL
  }
}

const fetchJson = function(url, onload, responseType = "json") {
  let oReq = new XMLHttpRequest();
  oReq.onload = onload
  oReq.open("GET", url);
  oReq.responseType = responseType;
  oReq.send();
}

export function covidTrackingfetchStatesDaily() {
  fetchJson(statesDailyUrl(), (e) => {
    let json = e.target.response
    store.dispatch(covidTrackingHandleStatesDaily(json))
  })

  return {
    type: types.COVIDTRACKING_FETCH_STATES
  };
}

function covidTrackingHandleStatesDaily(json) {
  let groups = _.groupBy(json, 'state')
  let states = Object.entries(groups).slice(0, DEBUG_MAX_STATES).map((statePair) => {
    //first entry is latest, so reverse
    let entries = statePair[1].reverse()
    let abbrev = statePair[0]
    let censusData = censusDataForAbbrev(abbrev)

    if(!censusData) { console.log(`couldnt find census data for state abbrev ${abbrev}`); }

    //TODO: add census density (so i can calculate total area from that?)
    return new StateModel({abbrev: abbrev, entries, population: censusData && censusData.population})
  })

  return {
    type: types.COVIDTRACKING_HANDLE_STATES,
    states: states
  };
}

//TODO: fetch the latest day.. may take 2 fetches. 
const JHGithubDir = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/"
const JHDailyReportUrl = function() {
  if(process.env.NODE_ENV === 'development') {
    return "http://localhost:3000/jh.daily.json"
  } else {
    return JHGithubDir + "/03-28-2020.csv"
  }
}

export function johnsHopkinsFetchDailyReport() {
  fetchJson(JHDailyReportUrl(), (e) => {
    let csv = e.target.response
    store.dispatch(johnsHopkinsHandleDailyReport(csv, '20200328'))
  }, 'text')

  return {
    type: types.JOHNS_HOPKINS_FETCH_DAILY_REPORT
  };
}

//CRZ: TODO: consider streaming.
//CRZ: TODO: does active = positive - death - recovered? if so can just lazily calc it
//CRZ: TODO: does last_update matter here?
//CRZ: record non US counties.
function johnsHopkinsHandleDailyReport(csv, date) {
  let results = Papa.parse(csv, {header: true})

  results.errors.forEach(error => {
    console.log(`error on row ${error.row}: ${error.code} ${error.message}`)
  })

  let counties = results.data.filter(res => res.Country_Region === "US" && res.FIPS).map(res => {
    const censusData = censusDataForFips(res.FIPS)

    if(!censusData) { console.log(`couldn't census data for county ${res.Admin2}, FIPS ${res.FIPS}`) }

    return new CountyModel({
      fips: res.FIPS,
      name: res.Admin2,
      stateName: res.Province_State,
      population: censusData && censusData.population,
      entries: [{
        date: date,
        positive: parseInt(res.Confirmed),
        death: parseInt(res.Deaths),
        recovered: parseInt(res.Recovered),
        active: parseInt(res.Active)
      }]
    })
  })

  return {
    type: types.JOHNS_HOPKINS_HANDLE_DAILY_REPORT,
    counties: counties
  };
}