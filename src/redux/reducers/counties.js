import * as types from '../types.js'

function states(state = [], action) {
  switch(action.type) {
    case types.JOHNS_HOPKINS_FETCH_DAILY_REPORT:
      //TODO: set loading state, and handle error
      return state

    case types.JOHNS_HOPKINS_HANDLE_DAILY_REPORT:
      return action.counties
    default:
      return state
  }
}

export default states;