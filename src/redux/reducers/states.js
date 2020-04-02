import * as types from '../types.js'

function states(state = [], action) {
  switch(action.type) {
    case types.COVIDTRACKING_FETCH_STATES_DAILY:
      //TODO: set loading state, and handle error
      return state
    case types.COVIDTRACKING_HANDLE_STATES_DAILY:
      return action.states

    case types.COVIDTRACKING_FETCH_STATES_CURRENT:
      //TODO: set loading state, and handle error
      return state
    case types.COVIDTRACKING_HANDLE_STATES_CURRENT:
      //XXXXX: this doesnt nicely coalesce existing with updated...
      // debugger
      return action.updatedStates
    default:
      return state
  }
}

export default states;