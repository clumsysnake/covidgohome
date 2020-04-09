import * as types from '../types.js'

export default function(state = [], action) {
  switch(action.type) {
    // case types.COVIDTRACKING_HANDLE_STATES_DAILY:
    //   return action.states
    // case types.COVIDTRACKING_HANDLE_STATES_CURRENT:
    //   //XXXXX: this doesnt nicely coalesce existing with updated...
    //   return action.updatedStates
    case types.COVIDGOHOME_HANDLE_STATES:
      return action.states
    default:
      return state
  }
}