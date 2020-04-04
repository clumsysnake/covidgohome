import * as types from '../types.js'

function states(state = [], action) {
  switch(action.type) {
    case types.COVIDGOHOME_FETCH_STATES:
      //TODO: set loading state
      return state

    case types.COVIDGOHOME_HANDLE_STATES:
      //TODO: could store the json
      return state
    case types.COVIDGOHOME_FETCH_STATES_ERROR:
      //TODO: handle error
      return state
    default:
      return state
  }
}

export default states;