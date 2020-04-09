//TODO: - consider adding geo data in
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
import * as H from './pipeline/helpers.js'

const CT_STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
const CT_STATESCURRENT_URL = "https://covidtracking.com/api/states"
const NYT_STATES_URL = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv"
const CT_DATE_FORMAT = 'YYYYMMDD'

//CRZ: Note: not all days have all these fields. old days havent changed.
//date, positive, negative, pending, death, recovered, totalTestResults, 
//hospitalizedCumulative, hospitalizedCurrently, hospitalizedCumulative, 
//inIcuCurrently, inIcuCumulative, 
//onVentilatorCurrently, onVentilatorCumulative, 
//deathIncrease, hospitalizedIncrease, negativeIncrease, 
//positiveIncrease, totalTestResultsIncrease
//dateChecked, hash, fips, state
function translateCtDailyFrame(ct) {
  return {
    //INDEXES
    date: ctDateParse(ct.date),
    // dateChecked: ctDateCheckedParse(ct.dateChecked),

    //COUNTS
    positives: ct.positive,
    negatives: ct.negative,
    collections: ct.positive + ct.negative + (ct.pending || 0),
    deaths: ct.death,
    recoveries: ct.recovered,
    admissions: ct.hospitalizedCumulative,
    intensifications: ct.inIcuCumulative,
    ventilations: ct.onVentilatorCumulative, 
    //derived: results, resolutions

    //TOGGLES
    onVentilator: ct.onVentilatorCurrently,
    inHospital: ct.hospitalizedCurrently,
    inICU: ct.inIcuCurrently
    //derived: pending, active
  }
}

//CORE: positive negative pending death totalTestResults recovered
//hospitalizedCumulative hospitalizedCurrently hospitalizedCumulative 
//inIcuCurrently inIcuCumulative 
//onVentilatorCurrently onVentilatorCumulative 
//REDUNDANT: state, posNeg, fips, lastUpdateEt, checkTimeEt, , total
//SCORES: positiveScore, negativeScore, negativeRegularScore, commercialScore, grade, score, 
//ELSE: dateModified, dateChecked, notes, hash
function translateCtCurrentFrame(ct) {
  return {
    //INDEXES
    // date: ctDateParse(ct.date),
    //dateChecked: ctDateCheckedParse(dateChecked)
    //dateModified: ctDateCheckedParse(dateModified)

    //COUNTS
    positives: ct.positive,
    negatives: ct.negative,
    collections: ct.positive + ct.negative + (ct.pending || 0),
    deaths: ct.death,
    recoveries: ct.recovered,
    admissions: ct.hospitalizedCumulative,
    intensifications: ct.inIcuCumulative,
    ventilations: ct.onVentilatorCumulative, 
    //derived: results, resolutions

    //TOGGLES
    onVentilator: ct.onVentilatorCurrently,
    inHospital: ct.hospitalizedCurrently,
    inICU: ct.inIcuCurrently
    //derived: pending, active
  }
}

const ctDateParse = function(string) {
  return string
}

const ctDateCheckedParse = function(string) {
  return moment(string).unix()
}

//CRZ: atm positive, negative, and death determine equality, nothing else. whats best is unclear.
function cghFrameEqualsCtFrame(cghFrame, ctFrame) {
  return  cghFrame.positives === ctFrame.positive && 
          cghFrame.negatives === ctFrame.negative && 
          cghFrame.deaths === ctFrame.death
}

//CRZ: increments date and adds rest of fields
function possiblyAddDaily(state, ctCurrent) {
  if(!ctCurrent) {
    return false
  }

  let lastFrame = _.last(state.frames)
  if(cghFrameEqualsCtFrame(lastFrame, ctCurrent)) {
    return false
  }

  let frame = translateCtCurrentFrame(ctCurrent)
  frame.date = parseInt(moment(lastFrame.date, CT_DATE_FORMAT).add(1, 'days').format(H.CGH_DATE_FORMAT))
  state.frames.push(frame)

  return true
}

//Fetch everything, then group it together
function groupSources(then) {
  return Promise.all([
    H.handleFetch(CT_STATESDAILY_URL),
    H.handleFetch(CT_STATESCURRENT_URL),
    H.handleFetch(NYT_STATES_URL, 'text')
  ]).then(([ctStatesDaily, ctStatesCurrent, nytStatesCsv]) => {
    let mappingJson = H.readMapping()
    let censusJson = H.readStateCensus()
    let nytStates = Papa.parse(nytStatesCsv).data //TODO: handle error

    //TODO: report on all errors
    
    let groups = _.compact(mappingJson.map(mapping => {
      let census = censusJson.find((r) => mapping.name === r[2] )
      return {
        name: mapping.name,
        abbreviation: mapping.abbreviation,
        census: census,
        nyt: _.sortBy(nytStates.filter(x => x.state === mapping.name), 'date'),
        ctDaily: ctStatesDaily.filter(x => x.state === mapping.abbreviation),
        ctCurrent: ctStatesCurrent.filter(x => x.state === mapping.abbreviation)[0]
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
      population: g.census && parseInt(g.census[1]),
      density: g.census && parseFloat(g.census[0]),
    }

    //Add normal series
    Object.assign(state, {frames: g.ctDaily.map(x => translateCtDailyFrame(x)).reverse()})  

    //Add states current unless it already exists.
    if(possiblyAddDaily(state, g.ctCurrent)) {
      console.log(`added daily CovidTracking data to ${state.name}`)
    }

    return state
  })
}

function packageStatesJson(json) {
  return {
    version: H.FORMAT_VERSION,
    timestamp: Date.now(),
    states: json,
  }
}

const uploadToS3 = (process.argv[2] === "--upload")
groupSources((groups) => {
  const finalJson = packageStatesJson(createStatesJson(groups))

  if(uploadToS3) {
    H.S3Upload(finalJson, H.STATES_S3_KEY)
  } else {
    let filename = process.argv[2]
    H.writeResults(finalJson, filename)
  }
})
