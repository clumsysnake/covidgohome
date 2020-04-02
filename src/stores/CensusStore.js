import UsStateMapping from './us_state_mapping.json'
import UsStateCensus from './us_state_census.json'
import UsCountyCensus from './us_county_census.json'

//TODO: staticly fetching this. afaik census updates the data once per year.
//https://api.census.gov/data/2019/pep/population?get=COUNTY,DATE_CODE,DATE_DESC,DENSITY,POP,NAME,STATE&for=state:*&DATE_CODE=12
//https://api.census.gov/data/2019/pep/population?get=COUNTY,DATE_CODE,DATE_DESC,DENSITY,POP,NAME,STATE&for=county:*&DATE_CODE=12

export function censusDataForState(name) {
  let row = UsStateCensus.find(item => {
    return item[2] === "7/1/2019 population estimate" && 
           item[5].toUpperCase() === name.toUpperCase()
  })

  if(!row) { return null }

  return {
    density: parseInt(row[3]),
    population: parseInt(row[4]),
    name: row[5],
    number: row[6]
  }
}

export function censusDataForFips(fips) {
  const fipsAsString = fips.toString()

  const stateNumber = fipsAsString.slice(0, 2)
  const countyNumber = fipsAsString.slice(2, 10)

  let row = UsCountyCensus.find(item => {
    return item[8] === stateNumber && item[9] === countyNumber
  })

  if(!row) { return null }

  return {
    density: parseInt(row[3]),
    population: parseInt(row[4]),
    name: row[5]
  }
}

export function stateNameForAbbrev(abb) {
  const map = UsStateMapping.find((map) => map.abbreviation === abb) || null
  return map && map['name']
}

export function censusDataForAbbrev(abbrev) {
  let name = stateNameForAbbrev(abbrev) || null

  return name && censusDataForState(name)
}

export { UsStateMapping, UsCountyCensus, UsStateCensus }