//TODO: - do the same for counties: census, jh historical county data
//      - consider adding geo data in
//      - can i use dateModified, dateChecked, or checkTimeEt to match current up with daily?
//      - distinguish between states, territories, and districts
//      - unite the field lists and other modelly functions with AreaModel
//      - test if the way i just increment the date field for ctDaily is legit
//      - review the timestamp zones. what zone should a datestamp be in?

 //Really dont know how to reconcile the data based on timestamps... the feeds dont seem coordinated.
//So for now, if all the fields are the same, then dont add a new entry. If anything has changed since last, add a new one.
//Also unsure what date to really be using here...basically just incrementing one from the last entry.

import _ from 'lodash'
import Papa from 'papaparse'
import moment from 'moment'
import fetch from 'node-fetch'
import fs from 'fs'
import AreaModel from '../models/AreaModel.js'

const CT_STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
const CT_STATESCURRENT_URL = "https://covidtracking.com/api/states"
const NYT_STATES_URL = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv"
const MAPPING_JSON = "src/stores/us_state_mapping.json"
const CENSUS_JSON  = "src/stores/census-2019-07-01-pop-estimate.json"

// function suspectedMissingDay(e) {
//   return AreaModel.deltaStats.every(s => e[s] === 0) && e.positive > 100
// }

// const stateReports = (states) => states.map(s => {
//   let zeroDeltaEntries = s.ctSeries.filter(suspectedMissingDay)
//   // debugger
//   return Object.assign({}, s, {
//     zeroDeltaMapping: zeroDeltaEntries.map(e => {
//       return {
//         ct: e,
//         nyt: s.nytSeries.find(nyt => e.date === nyt.date)
//       }
//     })
//   })
// })

//CRZ: Note: not all days have all these fields. old days havent changed.
const ctDailyPickFields =[
  "date", "positive", "negative", "pending", "death", "recovered", "totalTestResults", 
  "hospitalizedCumulative", "hospitalizedCurrently", "hospitalizedCumulative", 
  "inIcuCurrently", "inIcuCumulative", 
  "onVentilatorCurrently", "onVentilatorCumulative", 
  "deathIncrease", "hospitalizedIncrease", "negativeIncrease", 
  "positiveIncrease", "totalTestResultsIncrease"
]
//removed: dateChecked, hash, fips, state
function translateCtDailyFrame(ct) {
  let h = _.pick(ct, ctDailyPickFields)
  h.date = dateParse(h.date)
  return h
}

//CRZ: Note: not all days have all these fields. old days havent changed.
const ctCurrentPickFields = [
  "positive", "negative", "pending", "death", "totalTestResults", "recovered",
  "hospitalizedCumulative", "hospitalizedCurrently", "hospitalizedCumulative", 
  "inIcuCurrently", "inIcuCumulative", 
  "onVentilatorCurrently", "onVentilatorCumulative"
 ] 
//removed: state, positiveScore, negativeScore, negativeRegularScore, commercialScore, grade, score, 
//         posNeg, fips, dateModified, dateChecked, notes, hash, lastUpdateEt, checkTimeEt, total
function translateCtCurrentFrame(ct) {
  return _.pick(ct, ctCurrentPickFields)
}

const dateParse = function(string) {
  return moment(string, 'YYYYMMDD').unix()
}


function containsFrame(series, frame) {
  return !!series.find((f) => AreaModel.areEqualFrames(f, frame))
}

//CRZ: increments date and adds rest of fields
function possiblyAddDaily(state, group, current) {
  if(!containsFrame(state.series, group.ctCurrent)) {
    return false
  }

  let last = _.last(state.series)
  let date = moment.unix(last.date).add(1, 'days').unix()
  let abbrev = state.abbreviation

  let frame = translateCtCurrentFrame(current)
  frame.assign({
    date,
    state: abbrev,
    positiveIncrease: frame.positive - last.positive,
    negativeIncrease: frame.negative - last.negative,
    deathIncrease:  frame.death - last.death,
    hospitalizedIncrease: frame.hospitalizedCumulative - last.hospitalizedCumulative,
    totalTestResultsIncrease: frame.totalTestResults - last.totalTestResults
  })
  state.series.push(frame)
}

//Fetch everything, then group it together
function groupSources(then) {
  return Promise.all([
    fetch(CT_STATESDAILY_URL).then(res => res.json()),
    fetch(CT_STATESCURRENT_URL).then(res => res.json()),
    fetch(NYT_STATES_URL).then(res => res.text())
  ]).then(([ctStatesDaily, ctStatesCurrent, nytStatesCsv]) => {
    let mappingJson = JSON.parse(fs.readFileSync(MAPPING_JSON, {encoding: 'ascii'}))
    let censusJson = JSON.parse(fs.readFileSync(CENSUS_JSON, {encoding: 'ascii'}))
    let nytStates = Papa.parse(nytStatesCsv).data //TODO: handle error

    //TODO: report on when we cant find it.
    

    let groups = _.compact(mappingJson.map(mapping => {
      let census = censusJson.find((r) => mapping.name === r[2] )
      return {
        name: mapping.name,
        abbreviation: mapping.abbreviation,
        census: census,
        nyt: _.sortBy(nytStates.filter(x => x.state === mapping.name), 'date'),
        ctDaily: ctStatesDaily.filter(x => x.state === mapping.abbreviation),
        ctCurrent: ctStatesCurrent.filter(x => x.state === mapping.abbreviation)
      }
    }))

    then(groups)
  })
}

//From the grouped data, combine it into per state jsons
function createStatesJson(groups) {
  return groups.map(g => {
    let state = {
      name: g.name,
      abbrev: g.abbreviation,
      fips: g.census && g.census[3], //as string.
      population: g.census && g.census[1],
      density: g.census && g.census[0],
    }

    //Add normal series
    Object.assign(state, {series: g.ctDaily.map(x => translateCtDailyFrame(x)).reverse()})  

    //Add states current unless it already exists.
    possiblyAddDaily(state, g)

    return state
  })
}

function outputResults(json, filename = null) {
  let jsonString = JSON.stringify(json)

  if(_.isNil(filename)) {
    process.stdout.write(jsonString)
  } else {
    fs.writeFileSync(filename, jsonString) //TODO: defined encoding
  }
}

function packageStatesJson(json) {
  return {
    states: json,
    timestamp: Date.now()
  }
}

let filename = process.argv[2]
groupSources((groups) => {
  outputResults(packageStatesJson(createStatesJson(groups)), filename)
})
