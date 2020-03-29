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

  return (
    <div className="state-page">
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
        <DailyChart key={state.abbreviation} name={state.name} series={state.entries} 
                    totals={state.totals} />
        <CumulativeChart key={state.abbreviation} name={state.name} series={state.entries} 
                    totals={state.totals} />
      </div>
    </div>
  )
}

function mapStateToProps(state, ownProps) {
  let abbrev = ownProps.match.params.stateAbbrev
  return {state: state.states.find(s => s.abbreviation.toUpperCase() === abbrev)}
}

export default connect(mapStateToProps)(StatePage)