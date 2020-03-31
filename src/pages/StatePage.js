import React, {useState} from 'react';
import ReactTooltip from 'react-tooltip';
import { connect } from 'react-redux';
import DailyChart from '../components/DailyChart.js'
import CumulativeChart from '../components/CumulativeChart.js'
import DeathHospitalizationChart from '../components/DeathHospitalizationChart.js'
import StateMap from '../components/StateMap.js'
import './StatePage.css'
import { numberWithCommas, withPlaces } from '../helpers/chartHelpers.js'
import _ from 'lodash'

function StatePage(props) {
  let state = props.state
  const [tooltip, setTooltip] = useState('')

  if(!state) { return <div>...loading</div> }

  let scaledPercentage = state.scaledToPercentage()

  //TODO: this line has so much wrong with it... fix AreaModel
  let deadPer1M = _.last(state.scaledPerMillion()).death

  return (
    <div className="state-page">
      <h1 className="state-name">{state.name}</h1>
      <div className="top">
        <div className="state-map">
          <StateMap
            state={state}
            field="positive"
            basis="per-1m"
            granularity="county"
            colorScale="linear"
            setTooltipContent={(c) => setTooltip(c)}
          />
          <ReactTooltip place="right">{tooltip}</ReactTooltip>
        </div>
        <div className="stats">
          <ul>
            <li>
              <span className="label">Population</span>
              <span className="value">{numberWithCommas(state.population)}</span>
            </li>
            <li>
              <span className="label">Confirmed</span>
              <span className="value">{numberWithCommas(state.totals.positive)}</span>
            </li>
            <li>
              <span className="label">Attack Rate</span>
              <span className="value">{withPlaces(state.totals.attackRate, 3)}%</span>
            </li>
            <li>
              <span className="label">CFR</span>
              <span className="value">{withPlaces(state.totals.cfrPercent, 2)}% (based on positives)</span>
            </li>
            <li>
              <span className="label">Dead</span>
              <span className="value">{numberWithCommas(state.totals.death)} or {withPlaces(deadPer1M, 2)}/million</span>
            </li>
            <li>
              <span className="label">Hospitalized</span>
              <span className="value">{state.totals.hospitalized || "Unknown"}</span>
            </li>
            <li>
              <span className="label">Active</span>
              <span className="value">Unknown</span>
            </li>
            <li>
              <span className="label">Recovered</span>
              <span className="value">Unknown</span>
            </li>
            <li>
              <span className="label">Resolved</span>
              <span className="value">Unknown</span>
            </li>
          </ul>
        </div>
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