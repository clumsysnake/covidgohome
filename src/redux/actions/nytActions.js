import Papa from 'papaparse'
import moment from 'moment'
import * as types from '../types'
import store from '../store'
import { fetchXhr } from './helpers'

const STATES_URL = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv"
// const COUNTIES_URL = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv"

const statesUrl = function() {
  return (process.env.NODE_ENV === 'development') ? "http://localhost:3000/nyt.states.csv" : STATES_URL
}

const dateParse = function(string) {
  return moment(string).unix()
}

function fetchStates() {
  fetchXhr(statesUrl(), (e) => {
    let json = e.target.response
    store.dispatch(handleStates(json))
  }, null, 'text')

  return {
    type: types.NYT_FETCH_STATES
  };
}

function handleStates(csv) {
  let states = Papa.parse(csv, {header: true}).data//TODO: report errors
  states.forEach(s => s.date = dateParse(s.date)) //TODO: prolly can do this with papa instead

  return {
    type: types.NYT_HANDLE_STATES,
    states: states,
  };
}

export default { fetchStates }