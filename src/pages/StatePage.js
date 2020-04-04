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
import { numberWithCommas, percentWithPlaces, withPlaces } from '../helpers/chartHelpers.js'
import _ from 'lodash'

function StatePage(props) {
  const [tooltip, setTooltip] = useState('')
  const [mapField, setMapfield] = useState('positive')
  const [basis, setBasis] = useState('per-1m')
  const [colorScale, setColorScale] = useState('linear')
  
  if(!props.state) { return <div>...loading</div> }

  let state = props.state
  let totals = state.totals
  let scaledPercentage = state.scaledToPercentage()
  //TODO: this line has so much wrong with it... fix AreaModel
  let deadPer1M = _.last(state.scaledPerMillion()).death

  let curr = state.currentFrame

  return (
    <div className="state-page">
      <div className="top">
        <div className="state-map">
          <StateMap
            state={state}
            field={mapField}
            basis={basis}
            granularity="county"
            colorScale={colorScale}
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
            <Filter accessors={[colorScale, setColorScale]} options={[
              'linear',
              'sqrt',
              ['log2', 'log(2)']
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
              <span className="label">Tests Performed</span>
              <span className="value">{numberWithCommas(totals.totalTestResults)}</span>
            </li>
            <li>
              <span className="label">Tests Positive</span>
              <span className="value">{numberWithCommas(totals.positive)} or {percentWithPlaces(totals.positivePercent, 2)}</span>
            </li>
            <li>
              <span className="label">Attack Rate</span>
              <span className="value">{withPlaces(totals.attackRate, 3)}%</span>
            </li>
            <li>
              <span className="label">CFR (estimated)</span>
              <span className="value">{withPlaces(totals.cfrPercent, 2)}%</span>
            </li>
            <li>
              <span className="label">Dead</span>
              <span className="value">{numberWithCommas(totals.death)} or {withPlaces(deadPer1M, 2)}/million</span>
            </li>
            <li>
              <span className="label">Total Hospitalizations</span>
              <span className="value">{numberWithCommas(curr.hospitalizedCumulative) || "Unknown"}</span>
            </li>
            <li>  
              <span className="label">Total Hospitalization Rate (estimated)</span>
              <span className="value">{percentWithPlaces(totals.hospitalizationRate, 2) || "Unknown"}</span>
            </li>
            <li>
              <span className="label">Currently Hospitalized</span>
              <span className="value">{numberWithCommas(curr.hospitalizedCurrently) || "Unknown"}</span>
            </li>
            <li>
              <span className="label">Hospitalizations Recovered</span>
              <span className="value">{numberWithCommas(curr.recovered) || "Unknown"}</span>
            </li>
            <li>
              <span className="label">Currently in ICU</span>
              <span className="value">{numberWithCommas(curr.inIcuCurrently) || "Unknown"}</span>
            </li>*
            {/* active, resolved */}
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