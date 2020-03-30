import React from 'react';
import { connect } from 'react-redux';
import DailyChart from '../components/DailyChart.js'
import CumulativeChart from '../components/CumulativeChart.js'
import DeathHospitalizationChart from '../components/DeathHospitalizationChart.js'
import './StatePage.css'
import { numberWithCommas, withPlaces } from '../helpers/chartHelpers.js'
import _ from 'lodash'

function StatePage(props) {
  let state = props.state

  if(!state) { return <div>...loading</div> }

  let scaledPercentage = state.scaledToPercentage()
  //TODO: this line has so much wrong with it... fix AreaModel
  let deadPer1M = _.last(state.scaledPerMillion()).death

  return (
    <div className="state-page">
      <h1 className="state-name">{state.name}</h1>
      <div className="stats">
        <ul>
          <li>Population {numberWithCommas(state.population)}</li>
          <li>Confirmed Positive: {state.totals.positive}</li>
          <li>Attack Rate {withPlaces(state.totals.attackRate, 3)}%</li>
          <li>Case Fatality Ratio: {withPlaces(state.totals.cfrPercent, 2)}% (based on positives, not resolved)</li>
          <li>Dead: {state.totals.dead} people, or {withPlaces(deadPer1M, 2)} per million</li>
          <li>Hospitalized: {state.totals.hospitalized || "Unknown"}</li>
          <li>Currently Infected: Unknown (need recovered data)</li>
          <li>Recovered: Unknown</li>
          <li>Resolved: Unknown</li>
        </ul>
      </div>

      <div className="charts">
        <DailyChart name="Daily Changes"
          series={state.entries} />
        <CumulativeChart name="Test Results as % of Total Tests"
          series={scaledPercentage} basis="percentage" yDomain={[0,100]}/>
        <DeathHospitalizationChart name="Daily Deaths and Hospitalizations"
          series={state.entries} />
      </div>
    </div>
  )
}

function mapStateToProps(state, ownProps) {
  let abbrev = ownProps.match.params.stateAbbrev
  return {state: state.states.find(s => s.abbreviation.toUpperCase() === abbrev)}
}

export default connect(mapStateToProps)(StatePage)