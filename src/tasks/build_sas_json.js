//CRZ: If you take the OMB excel tables (from census.gov), convert to csv, remove
//     the extraneous fields, then you'll be left with a normal looking csv
//     that you can feed into here

//TODO: should i see metropolitan divisions? dunno what they are.
//TODO: should we definethe SA codes as integers or strings?

import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

import * as H from './pipeline/helpers.js'

if(!process.argv[2] || !process.argv[3]) {
  console.log("arguments: <csv input file> <output file>")
  process.exit(1)
}

let input_file = path.resolve(process.argv[2])
let output_file = path.resolve(process.argv[3])

console.log(`opening ${input_file}`)

let csvString = fs.readFileSync(input_file, {encoding: 'ascii'})
let results = Papa.parse(csvString, {header: true})

results.errors.forEach(error => {
  console.log(`${error.row || error.type}: ${error.code} ${error.message}`)
})

console.log(`found ${results.data.length} rows`)

let models = []
function addRow(type, row, cb) {
  let code = row[`${type} Code`]
  if(code !== '') {
    let model = models.find(x => x.code === code && x.type === type)
    if(!model) {
      model = {
        code: code,
        type: type,
        title: row[`${type} Title`],
        counties: []
      }
      models.push(model)
    }

    model.counties.push({
      fips: row['FIPS State Code'] + row['FIPS County Code'],
      name: row['County/County Equivalent'],
      state: row['State Name']
    })

    if(cb) { cb(model, row) }
  }
}

results.data.forEach(row => {
  addRow('CSA', row, (model, row) => {
    let x = row['CBSA Code']
    if(!model.cbsaCodes) {
      model.cbsaCodes = [x]
    } else if(!model.cbsaCodes.includes(x)) {
      model.cbsaCodes.push(x)
    }
  })

  addRow('CBSA', row, (model, row) => {
    let val = row['Metropolitan/Micropolitan Statistical Area']
    model.cbsaType = (val.split(' ')[0] === "Micropolitan") ? "µSA" : "MSA"
  })

  // addRow('Metropolitan Division', row)
})

fs.writeFileSync(output_file, H.stringify(models))


