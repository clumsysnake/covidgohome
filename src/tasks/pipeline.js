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
import AWS from 'aws-sdk'
import AreaModel from '../models/AreaModel.js'

const JH_BASEURL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/"
const CT_STATESDAILY_URL = "https://covidtracking.com/api/states/daily"
const CT_STATESCURRENT_URL = "https://covidtracking.com/api/states"
const NYT_STATES_URL = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv"
const MAPPING_JSON = "src/stores/us_state_mapping.json"
const CENSUS_JSON  = "src/stores/census-2019-07-01-pop-estimate.json"
const S3_KEY = "data/states.json"
const FORMAT_VERSION = 3

const DATE_FORMAT = 'YYYYMMDD'

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
  frame.date = parseInt(moment(lastFrame.date, DATE_FORMAT).add(1, 'days').format(DATE_FORMAT))
  state.frames.push(frame)

  return true
}

function handleFetch(url, type = 'json') {
  return function(res) {
    if(res.ok) {
      console.log(`fetch successful for ${url}`)
      if(type === 'json') {
        return res.json()
      } else {
        return res.text()
      }
    } else {
      console.log(`fetch error for ${url}: res.statusText`)
      process.exit(1)
    }
  }
}

//Fetch everything, then group it together
function groupSources(then) {
  return Promise.all([
    fetch(CT_STATESDAILY_URL).then(handleFetch(CT_STATESDAILY_URL)),
    fetch(CT_STATESCURRENT_URL).then(handleFetch(CT_STATESCURRENT_URL)),
    fetch(NYT_STATES_URL).then(handleFetch(NYT_STATES_URL, 'text'))
  ]).then(([ctStatesDaily, ctStatesCurrent, nytStatesCsv]) => {
    let mappingJson = JSON.parse(fs.readFileSync(MAPPING_JSON, {encoding: 'ascii'}))
    let censusJson = JSON.parse(fs.readFileSync(CENSUS_JSON, {encoding: 'ascii'}))
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

function outputResults(json, filename = null) {
  let jsonString = stringify(json)

  if(_.isNil(filename)) {
    process.stdout.write(jsonString)
  } else {
    fs.writeFileSync(filename, jsonString) //TODO: defined encoding
  }
}

function packageStatesJson(json) {
  return {
    version: FORMAT_VERSION,
    timestamp: Date.now(),
    states: json,
  }
}

function stringify(json) {
  return JSON.stringify(json)
}

let __awsClient
function s3Client() {
  return __awsClient || (__awsClient = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }))
}

function uploadResults(json) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: S3_KEY,
    Body: stringify(json)
  };
  s3Client().upload(params, function(err, data) {
   console.log(err, data);
  });  
}

const uploadToS3 = (process.argv[2] === "--upload")

groupSources((groups) => {
  const finalJson = packageStatesJson(createStatesJson(groups))

  if(uploadToS3) {
    uploadResults(finalJson)
  } else {
    let filename = process.argv[2]
    outputResults(finalJson, filename)
  }
})
