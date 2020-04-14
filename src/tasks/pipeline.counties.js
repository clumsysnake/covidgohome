import Papa from 'papaparse'
import moment from 'moment'
import _ from 'lodash'
import * as H from './pipeline/helpers.js'

const JH_BASEURL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/"
const JH_DATEFORMAT = 'MM-DD-YYYY'
const DAYS_PREVIOUS_WINDOW = 1

const datesToFetch = _.times(DAYS_PREVIOUS_WINDOW, (n) => {
  return moment().subtract(`${n+1}`, 'day').format(JH_DATEFORMAT)
})

const censusCounties =  H.readCountyCensus().slice(1) //The first line is headers

function dateParse(string) {
  return moment(string, JH_DATEFORMAT).format(H.CGH_DATE_FORMAT)
}

function csvUrl(date) {
  return `${JH_BASEURL}/${date}.csv`
}

//JH *sometimes* drops 0 prefix (most likely because of casting to integer). ex. 6001 & 06001
function isFipsEqual(a, b) {
  return parseInt(a) === parseInt(b)
}

function csvDateMaps(csvs) {
  return csvs.map((csv, i) => {
    let results = Papa.parse(csv, {header: true})

    results.errors.forEach(error => {
      console.log(`${datesToFetch[i]} error on row ${error.row}: ${error.code} ${error.message}`)
    })

    return {
      jh: results.data.filter(x => x.Country_Region === "US" && x.FIPS),
      date: datesToFetch[i]
    }
  }).reverse() // crucial reverse to get dates sorted
}

//Fetch everything, then group it together
function groupSources(then) {
  return Promise.all(datesToFetch.map(date => {
    return H.handleFetch(csvUrl(date), 'text')
  })).then((csvs) => {  
    let dateMaps = csvDateMaps(csvs)

    let groups = censusCounties.map(censusData => {
      let fips = censusData[0] + censusData[1]

      return {
        fips: fips,
        census: censusData,
        jhByDate: dateMaps.map(dateMap => ({
          jh: dateMap.jh.find(x => isFipsEqual(x.FIPS, fips)),
          date: dateMap.date
        }))
      }
    })

    then(groups)
  })
}

function packageCountiesJson(json) {
  return {
    version: H.FORMAT_VERSION,
    timestamp: Date.now(),
    counties: json,
  }
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
  const nycCountyNums = ["005", "061", "081", "085", "047"]

  let rows = censusCounties.filter(
    row => nycCountyNums.includes(row[1]) && row[0] === "36"
  )

  return {
    // density: ?
    population: rows.map(row => parseInt(row[3])).reduce((t, p) => t + p)
  }
}

function createCountiesJson(groups, date) {
  return groups.map(group => {
    let [countyName, stateName] = group.census[4].split(',').map(s => s.trim())
    const population = (group.fips === "36061") ? censusDataNYCHack().population : parseInt(group.census[3])


    let frames = group.jhByDate.map(x => Object.assign(
      {date: parseInt(dateParse(x.date))},
      x.jh ? translateJhFrame(x.jh) : {},
    ))


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
