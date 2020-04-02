import * as types from '../types.js'

export default (state = {}, action) => {
  switch(action.type) {
    case types.NYT_HANDLE_STATES:
      return Object.assign({}, state, {states: action.states})
    default:
      return state
  }
}