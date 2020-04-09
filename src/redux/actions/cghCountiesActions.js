import * as types from '../types'
import store from '../store'
import CountyModel from '../../models/CountyModel'
import * as H from './helpers'

const COUNTIES_URL = H.S3_BUCKET + "/data/counties.json"

const url = function() {
  return H.inDev ? "/data/counties.json" : COUNTIES_URL
}

function fetch() {
  H.fetchXhr(
    url(),
    (e) => {
      let json = e.target.response
      store.dispatch(handle(json))
    },
    (e) => {
      store.dispatch(handleError())
    },
    'json',
    {
      'Cache-control': 'no-cache',
      'Pragma': 'no-cache'
    }
  )

  return {
    type: types.COVIDGOHOME_FETCH_COUNTIES
  };
}

function handleError() {
  return {
    type: types.COVIDGOHOME_FETCH_COUNTIES_ERROR,
  };
}

//CRZ: our own data is perfectly suited for our model, so there is little to handle.
function handle(json) {
  let counties = json.counties.map((state) => new CountyModel(state))

  return {
    type: types.COVIDGOHOME_HANDLE_COUNTIES,
    json: json,
    counties: counties
  };
}

export default { fetch }