import _ from '../../lodash.js'
import fs from 'fs'
import path from 'path'
import AWS from 'aws-sdk'
import fetch from 'node-fetch'

//TODO: whats best practice for this?
let pathname = (new URL(import.meta.url)).pathname
export const ROOT_DIR = path.resolve(pathname, '../../../..')

export const CGH_DATE_FORMAT = 'YYYYMMDD'
export const FORMAT_VERSION = 4
export const COUNTIES_S3_KEY = "data/counties.json"
export const STATES_S3_KEY = "data/states.json"
const US_REGIONS_JSON = "src/stores/us_regions.json"
const USPS_MAPPING_JSON = "src/stores/usps_code_mapping.json"
const STATE_CENSUS_JSON = "src/stores/census-2019-07-01-pop-estimate.json"
const COUNTY_CENSUS_JSON = "src/stores/census-2019-07-01-pop-estimate.counties.json"

export function handleFetch(url, type = 'json') {
	return fetch(url).then(
		function(res) {
	    if(res.ok) {
	      console.log(`fetch successful for ${url}`)
	      if(type === 'json') {
	        return res.json()
	      } else {
	        return res.text()
	      }
	    } else {
	      console.log(`fetch error for ${url}: ${res.statusText}`)
	      process.exit(1)
	    }
	  }
  )
}

export function stringify(json) {
  return JSON.stringify(json)
}

export function S3Upload(json, key) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: stringify(json)
  };
  s3Client().upload(params, function(err, data) {
   console.log(err, data);
  });  
}

export function writeResults(json, filename = null) {
  let jsonString = stringify(json)

  if(_.isNil(filename)) {
    process.stdout.write(jsonString)
  } else {
    fs.writeFileSync(filename, jsonString) //TODO: defined encoding
  }
}

export function readUSRegions() {
  return JSON.parse(fs.readFileSync(US_REGIONS_JSON, {encoding: 'ascii'}))
}
export function readUSPSMapping() {
	return JSON.parse(fs.readFileSync(USPS_MAPPING_JSON, {encoding: 'ascii'}))
}
export function readStateCensus() {
  return JSON.parse(fs.readFileSync(STATE_CENSUS_JSON, {encoding: 'ascii'}))
}

let __countyCensus = null
export function readCountyCensus() {
  return __countyCensus || (__countyCensus = JSON.parse(
    fs.readFileSync(COUNTY_CENSUS_JSON, {encoding: 'ascii'}))
  )
}


let __awsClient
function s3Client() {
  return __awsClient || (__awsClient = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }))
}

