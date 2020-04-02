import Papa from 'papaparse'
import moment from 'moment'

import * as types from '../types'
import store from '../store'
import { censusDataForFips, UsCountyCensus } from '../../stores/CensusStore'
import CountyModel from '../../models/CountyModel'
import { fetchJson } from './helpers'

const hardCodedDate = '04-01-2020'
const githubDir = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/"
const dailyReportUrl = function() {
  if(process.env.NODE_ENV === 'development') {
    return "http://localhost:3000/jh.daily.json"
  } else {
    return githubDir + `${hardCodedDate}.csv`
  }
}

function fetchDailyReport() {
  fetchJson(dailyReportUrl(), (e) => {
    let csv = e.target.response
    store.dispatch(handleDailyReport(csv, dateParse(hardCodedDate)))
  }, 'text')

  return {
    type: types.JOHNS_HOPKINS_FETCH_DAILY_REPORT
  };
}

function dateParse(string) {
  return moment(string, 'MM-DD-YYYY').unix()
}

//New York City extends over its 5 boroughs. I assume its borders are coterminous with the combined area of its 5 counties:
  // Census data:
  // ["005","12","7/1/2019 population estimate","33726.504271","1418207","Bronx County, New York","36","12","36","005"],
  // ["061","12","7/1/2019 population estimate","71874.138732","1628706","New York County, New York","36","12","36","061"],
  // ["081","12","7/1/2019 population estimate","20719.741247","2253858","Queens County, New York","36","12","36","081"],
  // ["085","12","7/1/2019 population estimate","8277.8254914","476143","Richmond County, New York","36","12","36","085"],
  // ["047","12","7/1/2019 population estimate","36901.373131","2559903","Kings County, New York","36","12","36","047"],
//JH data, where it incorrectly lists new york city as FIPS 36061.
  //36061,New York City,New York,US,2020-03-31 23:43:56,40.76727260000001,-73.97152637,43119,932,0,0,"New York City, New York, US"
//CRZ: hackily, very hackily, give new york county's population as that of new york city's, to stop distorting the county maps.
//     JH gives us badly formatted data, aggregated by city not county, and i need to support a more complex data model.
//     this will fix color scaling issues for now.
function censusDataNYCHack() {
  const nycFIPS = ["36005", "36061", "36081", "36085", "36047"]

  return {
    // density:
    // name:
    population: nycFIPS.map(f => censusDataForFips(f).population).reduce((a, p) => a + p)
  }
}

//CRZ: TODO: consider streaming.
//CRZ: TODO: does active = positive - death - recovered? if so can just lazily calc it
//CRZ: TODO: does last_update matter here?
//CRZ: record non US counties.
function handleDailyReport(csv, date) {
  let results = Papa.parse(csv, {header: true})

  results.errors.forEach(error => {
    console.log(`error on row ${error.row}: ${error.code} ${error.message}`)
  })

  let jhCounties = results.data.filter(res => res.Country_Region === "US" && res.FIPS)

  let counties =  UsCountyCensus.map(row => {

    let fips = row[8] + row[9]
    let [countyName, stateName] = row[5].split(',').map(s => s.trim())
    const population = (fips === "36061") ? censusDataNYCHack().population : row[4]
    let jhCounty = jhCounties.find(c => c.FIPS === fips)

    let entries = [{
        date: date,
        positive: jhCounty ? parseInt(jhCounty.Confirmed) : 0,
        death: jhCounty ? parseInt(jhCounty.Deaths) : 0,
        active: jhCounty ? parseInt(jhCounty.Active) : 0
      }]

    return new CountyModel({
      fips,
      name: countyName,
      stateName: stateName,
      population,
      entries
    })
  })

  return {
    type: types.JOHNS_HOPKINS_HANDLE_DAILY_REPORT,
    counties: counties
  };
}

export default { fetchDailyReport }