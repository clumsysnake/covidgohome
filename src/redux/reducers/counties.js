import * as types from '../types.js'

export default function(state = [], action) {
  switch(action.type) {
    case types.COVIDGOHOME_HANDLE_COUNTIES:
	    // debugger
      return action.counties
    default:
      return state
  }
}