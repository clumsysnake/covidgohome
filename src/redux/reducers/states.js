import * as types from '../types.js'

function states(state = [], action) {
  switch(action.type) {
    case types.COVIDTRACKING_FETCH_STATES:
      //TODO: set loading state, and handle error
      return state

    case types.COVIDTRACKING_HANDLE_FETCHED_STATES:
      return action.states
    default:
      return state
  }
}

export default states;