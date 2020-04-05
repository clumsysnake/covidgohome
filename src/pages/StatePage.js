import React, {useState} from 'react';
import ReactTooltip from 'react-tooltip';
import { connect } from 'react-redux';
import DailyChangesChart from '../components/DailyChangesChart.js'
import DailyNewPositivesChart from '../components/DailyNewPositivesChart.js'
import PercentageTestResultsChart from '../components/PercentageTestResultsChart.js'
import DeathHospitalizationChart from '../components/DeathHospitalizationChart.js'
import StateMap from '../components/StateMap.js'
import Filter from '../components/Filter.js'
import './StatePage.css'
import { numberWithCommas, percentWithPlaces, withPlaces, percentTickFormatter } from '../helpers/chartHelpers.js'
import _ from 'lodash'

function StatePage(props) {
  const [tooltip, setTooltip] = useState('')
  const [mapField, setMapfield] = useState('positive')
  const [basis, setBasis] = useState('per-1m')
  const [colorScale, setColorScale] = useState('linear')
  const [chartType, setChartType] = useState('daily')
  const [trailingDays, setTrailingDays] = useState(null)
  
  if(!props.state) { return <div>...loading</div> }

  let state = props.state
  let totals = state.totals
  // let scaledPercentage = state.scaledToPercentage()
  //TODO: this line has so much wrong with it... fix AreaModel
  let deadPer1M = _.last(state.scaledPerMillion()).death

  let curr = state.currentFrame

  let entries, yTickFormatter
  switch(chartType) {
    case 'daily':
      entries = state.entries
      break;
    case 'daily-percent':
      entries = state.deltaPercentageSeries
      yTickFormatter = percentTickFormatter
      break;
    // case 'cumulative': entries = state.entries; break;
    default: //TODO: throw error
  }

  if(trailingDays) {
    entries = entries.slice(Math.max(entries.length - trailingDays, 0))
  }


  return (
    <div className="state-page">
      <div className="top">
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
              <span className="value">{percentWithPlaces(totals.attackRate, 3)}</span>
            </li>
            <li>
              <span className="label">CFR</span>
              <span className="value">{percentWithPlaces(totals.cfrPercent, 2)} (estimated)</span>
            </li>
            <li>
              <span className="label">Dead</span>
              <span className="value">{numberWithCommas(totals.death)} or {withPlaces(deadPer1M, 2)}/million</span>
            </li>
            <li>
              <span className="label">Hospitalizations</span>
              <span className="value">{numberWithCommas(curr.hospitalizedCumulative) || "unknown"} cumulative</span>
            </li>
            <li>
              <span className="label"></span>
              <span className="value">{numberWithCommas(curr.hospitalizedCurrently) || "unknown"} current</span>
            </li>
            <li>
              <span className="label"></span>
              <span className="value">{numberWithCommas(curr.recovered) || "unknown"} recovered</span>
            </li>
            <li>  
              <span className="label"></span>
              <span className="value">{percentWithPlaces(totals.hospitalizationRate, 2) || "unknown"} total rate</span>
            </li>
            <li>
              <span className="label">In ICU</span>
              <span className="value">{numberWithCommas(curr.inIcuCurrently) || "unknown"} currently</span>
            </li>
            <li>
              <span className="label">Ventilated</span>
              <span className="value">{numberWithCommas(curr.onVentilatorCurrently) || "unknown"} currently</span>
            </li>
            <li>
              <span className="label"></span>
              <span className="value">{numberWithCommas(curr.onVentilatorCumulative) || "unknown"} cumulative</span>
            </li>
            {/* active, resolved */}
          </ul>
        </div>
      </div>
      <hr />
      <div className="charts">
        <div className="filters-container">
          <div className="filters">
            <Filter accessors={[chartType, setChartType]} options={[
              ['daily', 'daily change'],
              ['daily-percent', '% daily change'],
              // 'cumulative'
            ]}/>
            <Filter accessors={[trailingDays, setTrailingDays]} options={[
              [null, 'all'],
              [21, 'last 21d'],
              [14, 'last 14d'],
            ]}/>
          </div>
        </div>

        <DailyNewPositivesChart name="Positives" series={entries} yTickFormatter={yTickFormatter}/>
        <DeathHospitalizationChart name="Deaths and Hospitalizations"
          series={entries} yTickFormatter={yTickFormatter}/>
        {/*<DailyChangesChart name="Tests & Results" series={entries} />*/}
{/*        <PercentageTestResultsChart name="Test Results as % of Total Tests"
          series={scaledPercentage} basis="percentage"/>
*/} 
     </div>
    </div>
  )
}

function mapStateToProps(state, ownProps) {
  let abbrev = ownProps.match.params.stateAbbrev
  return {state: state.states.find(s => s.abbreviation.toUpperCase() === abbrev)}
}

export default connect(mapStateToProps)(StatePage)