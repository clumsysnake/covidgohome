import React, {useState} from 'react';
import ReactTooltip from 'react-tooltip';
import { connect } from 'react-redux';
import DailyChangesChart from '../components/DailyChangesChart.js'
import DailyNewPositives from '../components/DailyNewPositives.js'
import PercentageTestResultsChart from '../components/PercentageTestResultsChart.js'
import DeathHospitalizationChart from '../components/DeathHospitalizationChart.js'
import StateMap from '../components/StateMap.js'
import Filter from '../components/Filter.js'
import './StatePage.css'
import { numberWithCommas, withPlaces } from '../helpers/chartHelpers.js'
import _ from 'lodash'

function StatePage(props) {
  const [tooltip, setTooltip] = useState('')
  const [mapField, setMapfield] = useState('positive')
  const [basis, setBasis] = useState('per-1m')
  
  let state = props.state

  if(!state) { return <div>...loading</div> }

  let scaledPercentage = state.scaledToPercentage()

  //TODO: this line has so much wrong with it... fix AreaModel
  let deadPer1M = _.last(state.scaledPerMillion()).death

  return (
    <div className="state-page">
      <div className="top">
        <div className="state-map">
          <StateMap
            state={state}
            field={mapField}
            basis={basis}
            granularity="county"
            colorScale="linear"
            setTooltipContent={setTooltip}
          />
          <ReactTooltip place="right">{tooltip}</ReactTooltip>
          <div className="filters">
            <Filter accessors={[mapField, setMapfield]} options={[
              ['positive', 'positives'],
              ['death', 'deaths']
            ]}/>
            <Filter accessors={[basis, setBasis]} options={[
              'total',
              ['per-1m', 'total / capita'],
              ['squared-per-1m', 'total² / capita']
            ]}/>
          </div>
        </div>
        <div className="stats">
          <h1 className="state-name">{state.name}</h1>
          <ul>
            <li>
              <span className="label">Population</span>
              <span className="value">{numberWithCommas(state.population)}</span>
            </li>
            <li>
              <span className="label">Positive</span>
              <span className="value">{numberWithCommas(state.totals.positive)}</span>
            </li>
            <li>
              <span className="label">Attack Rate</span>
              <span className="value">{withPlaces(state.totals.attackRate, 3)}%</span>
            </li>
            <li>
              <span className="label">CFR</span>
              <span className="value">{withPlaces(state.totals.cfrPercent, 2)}% (estimated)</span>
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
        <DailyNewPositives name="Daily New Positives" series={state.entries} />
        <DeathHospitalizationChart name="Daily Deaths and Hospitalizations"
          series={state.entries} />
        <DailyChangesChart name="Daily Tests & Results" series={state.entries} />
        <PercentageTestResultsChart name="Test Results as % of Total Tests"
          series={scaledPercentage} basis="percentage"/>
      </div>
    </div>
  )
}

function mapStateToProps(state, ownProps) {
  let abbrev = ownProps.match.params.stateAbbrev
  return {state: state.states.find(s => s.abbreviation.toUpperCase() === abbrev)}
}

export default connect(mapStateToProps)(StatePage)