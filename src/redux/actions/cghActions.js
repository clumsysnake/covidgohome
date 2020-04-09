import * as types from '../types'
import store from '../store'
import StateModel from '../../models/StateModel'
import * as H from './helpers'

const STATES_URL = H.S3_BUCKET + "/data/states.json"
const DEBUG_MAX_STATES = 1000 //CRZ: set lower to limit # of states fetched

const url = function() {
  return H.inDev ? "/data/states.json" : STATES_URL
}

function fetchStates() {
  H.fetchXhr(
    url(),
    (e) => {
      let json = e.target.response
      store.dispatch(handleStates(json))
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
    type: types.COVIDGOHOME_FETCH_STATES
  };
}

function handleError() {
  return {
    type: types.COVIDGOHOME_FETCH_STATES_ERROR,
  };
}

//CRZ: our own data is perfectly suited for our model, so there is little to handle.
function handleStates(statesJson) {
  //TODO: confirm that states key exists and that its an array
  let states = statesJson.states.slice(0, DEBUG_MAX_STATES).map((state) => new StateModel(state))

  return {
    type: types.COVIDGOHOME_HANDLE_STATES,
    json: statesJson,
    states: states
  };
}

export default { fetchStates }