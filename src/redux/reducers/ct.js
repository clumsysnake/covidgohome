import * as types from '../types.js'

export default (state = {}, action) => {
  switch(action.type) {
    case types.COVIDTRACKING_HANDLE_STATES_DAILY:
      return Object.assign({}, state, {statesDailyJson: action.json})
    case types.COVIDTRACKING_HANDLE_STATES_CURRENT:
      return Object.assign({}, state, {statesCurrentJson: action.json})
    default:
      return state
  }
}