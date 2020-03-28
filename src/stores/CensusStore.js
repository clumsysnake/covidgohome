import UsStateMapping from './us_state_mapping.json'
import UsStateCensus from './us_state_census.json'

//TODO: make this file a nice json, these numeric indexes are error-prone
const censusDataForState = (name) => {
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

const stateNameForAbbrev = (abb) => {
  const map = UsStateMapping.find((map) => map.abbreviation === abb) || null
  return map && map['name']
}

const censusDataForAbbrev = (abbrev) => {
  let name = stateNameForAbbrev(abbrev) || null

  return name && censusDataForState(name)
}

export { censusDataForState, censusDataForAbbrev, stateNameForAbbrev }