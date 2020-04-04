import * as types from '../types'
import store from '../store'
import StateModel from '../../models/StateModel'
import { fetchXhr } from './helpers'

const STATESDAILY_URL = "http://covidgohome.com/data/states.json"
const DEBUG_MAX_STATES = 1000 //CRZ: set lower to limit # of states fetched

const statesUrl = function() {
  return (process.env.NODE_ENV === 'development') ? "/data/states.json" : STATESDAILY_URL
}

function fetchStates() {
  fetchXhr(
    statesUrl(),
    (e) => {
      let json = e.target.response
      store.dispatch(handleStates(json))
    },
    (e) => {
      store.dispatch(handleError())
    },
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
  let states = statesJson.slice(0, DEBUG_MAX_STATES).map((state) => new StateModel(state))

  return {
    type: types.COVIDGOHOME_HANDLE_STATES,
    json: statesJson,
    states: states
  };
}

export default { fetchStates }