import React from 'react';
import { connect } from 'react-redux';
import DailyChart from '../components/DailyChart.js'
import CumulativeChart from '../components/CumulativeChart.js'
import './StatePage.css'
import { withPlaces } from '../helpers/chartHelpers.js'

function StatePage(props) {
  let state = props.state

  if(!state) { return <div>...loading</div> }

  let attack = 100 * state.totals.confirmed/state.population
  let cfr = 100 * state.totals.dead/state.totals.confirmed
  //TODO: this cfr isn't correct afaik! we need dead/(dead+recovered)

  let scaledSeries = state.scaledToPercentage()


  return (
    <div className="state-page">
      <h1 className="state-name">{state.name}</h1>
      <div className="stats">
        <ul>
          <li>Population {state.population}</li>
          <li>Attack Rate {withPlaces(attack, 3)}%</li>
          <li>Case Fatality Ratio: {withPlaces(cfr, 2)}%</li>
          <li>Dead: {state.totals.dead}</li>
          <li>Hospitalized: {state.totals.hospitalized || "Unknown"}</li>
          <li>Recovered: Unknown</li>
        </ul>
      </div>

      <div className="charts">
        <DailyChart name="Daily Changes" series={state.entries} />
        <CumulativeChart name="Cumulative Test Breakdown"
          series={scaledSeries} basis="percentage" yDomain={[0,100]}/>
      </div>
    </div>
  )
}

function mapStateToProps(state, ownProps) {
  let abbrev = ownProps.match.params.stateAbbrev
  return {state: state.states.find(s => s.abbreviation.toUpperCase() === abbrev)}
}

export default connect(mapStateToProps)(StatePage)