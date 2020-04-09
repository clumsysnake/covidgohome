import Papa from 'papaparse'
import moment from 'moment'
import * as H from './pipeline/helpers.js'
import fs from 'fs'

const JH_BASEURL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/"
const JH_DATEFORMAT = 'MM-DD-YYYY'

function dateParse(string) {
  return moment(string, JH_DATEFORMAT).format(H.CGH_DATE_FORMAT)
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
    // population: nycFIPS.map(f => censusDataForFips(f).population).reduce((a, p) => a + p)
  }
}

function csvUrl(date) {
  return `${JH_BASEURL}/${moment().subtract('1', 'day').format(JH_DATEFORMAT)}.csv`
}

function bestGuessLastDate() {
  return moment().subtract('1', 'day').format(JH_DATEFORMAT)
}

//Fetch everything, then group it together
function groupSources(then) {
  let csvDate = bestGuessLastDate()

  return Promise.all([
    H.handleFetch(csvUrl(csvDate), 'text'),
  ]).then(([jhCSV]) => {
    let countyCensusJson = H.readCountyCensus().slice(1) //The first line is headers
    let results = Papa.parse(jhCSV, {header: true})

    results.errors.forEach(error => {
      console.log(`error on row ${error.row}: ${error.code} ${error.message}`)
    })

    //filter only US counties atm.
    let jhCounties = results.data.filter(res => res.Country_Region === "US" && res.FIPS)

    //TODO: report on all errors

    let groups = countyCensusJson.map(censusData => {
      let fips = censusData[0] + censusData[1]

      return {
        fips: fips,
        census: censusData,
        jh: jhCounties.find(c => c.FIPS === fips)
      }
    })

    then(groups, csvDate)
  })
}

function packageCountiesJson(json) {
  return {
    version: H.FORMAT_VERSION,
    timestamp: Date.now(),
    counties: json,
  }
}

function createCountiesJson(groups, date) {
  return groups.map(group => {
    let [countyName, stateName] = group.census[4].split(',').map(s => s.trim())
    const population = (group.fips === "36061") ? censusDataNYCHack().population : group.census[3]

    let frames = []
    if(group.jh) {
      frames.push(Object.assign({date: dateParse(date)}, translateJhFrame(group.jh)))
    }

    return {
      fips: group.fips,
      density: group.census[2],
      name: countyName,
      stateName,
      population,
      frames
    }
  })
}

function translateJhFrame(jhFrame) {
  return {
    positives: parseInt(jhFrame.Confirmed),
    deaths: parseInt(jhFrame.Deaths),
    recoveries: parseInt(jhFrame.Recovered),
    //TODO: Active is also available... can i use as a checksum?
  }
}

//TODO: fugly passing around of date...
const uploadToS3 = (process.argv[2] === "--upload")
groupSources((groups, date) => {
  const finalJson = packageCountiesJson(createCountiesJson(groups, date))

  if(uploadToS3) {
    H.S3Upload(finalJson, H.COUNTIES_S3_KEY)
  } else {
    let filename = process.argv[2]
    H.writeResults(finalJson, filename)
  }
})
