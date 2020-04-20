import SACountyMapping from './sas.json'

//type of cbsa is [4]
//state name is [8]
//state fips is [9]
//county fips is [10]

export function CBSAForCode(code) {
  return SAForCode(code, 0, 3, 'CBSA')
}

export function CSAForCode(code) {
  return SAForCode(code, 2, 6, 'CSA')
}

function SAForCode(saCode, codeIndex, nameIndex, type) {
  saCode = parseInt(saCode)

  let rows = SACountyMapping.filter(row => row[codeIndex] === saCode)

  if(rows.length === 0) { return null }

  let name = rows[0][nameIndex]

  return {
    code: saCode,
    type,
    cbsaType: (rows[0][4] === "Micropolitan Statistical Area") ? "µSA" : "MSA",
    name, 
    shortName: name.split(',')[0],
    countiesFIPS: rows.map(x => stringFIPSFromNumbers(x[9], x[10])),
    statesInvolved: rows.map(x => x[8])
  }
}

//resulting FIPS always 5 chars
function stringFIPSFromNumbers(stateCode, countyCode) {
  let i = stateCode*1000 + countyCode
  return i.toString().padStart(5, '0')
}