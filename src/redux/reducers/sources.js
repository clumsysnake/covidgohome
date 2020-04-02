import * as types from '../types.js'

function sources(state = [], action) {
  switch(action.type) {
    case types.COVIDTRACKING_HANDLE_STATES_DAILY:
      //TODO: set loading state, and handle error
      return state

    case types.JOHNS_HOPKINS_HANDLE_DAILY_REPORT:
      return action.counties
    default:
      return state
  }
}

export default states;

