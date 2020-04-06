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
  const [mapField, setMapfield] = useState('positives')
  const [basis, setBasis] = useState('per-1m')
  const [colorScale, setColorScale] = useState('linear')
  const [chartType, setChartType] = useState('daily')
  const [timeframe, setTimeframe] = useState('first-death')
  const [averageDays, setAverageDays] = useState(1)
  
  if(!props.state) { return <div>...loading</div> }

  let state = props.state
  let current = state.series.last
  let currentPer1M = state.series.scale(1000000/state.population).last

  let yTickFormatter, chartData
  switch(chartType) {
    case 'cumulative':
      chartData = state.series.average(averageDays).frames
      break;
    case 'daily':
      chartData = state.series.deltize().average(averageDays).frames
      break;
    case 'daily-daily':
      chartData = state.series.deltize().deltize().average(averageDays).frames
      break;
    case 'daily-percent':
      chartData = state.series.deltaPercentize().average(averageDays).frames
      yTickFormatter = percentTickFormatter
      break;
    default: 
      throw new Error(`chart type ${chartType} unknown`)
  }

  let index = 0
  if(_.isInteger(timeframe)) {
    index = Math.max(chartData.length - timeframe, 0)
  } else if(timeframe === 'first-death') {
    index = chartData.findIndex(f => f.deaths > 0 )
  }

  chartData = chartData.slice(index)

  return (
    <div className="state-page">
      <div className="top">
        <div className="left">
          <div className="filters">
            <Filter accessors={[mapField, setMapfield]} options={[
              ['positives', 'positives'],
              ['deaths', 'deaths']
            ]}/>
            <Filter accessors={[basis, setBasis]} options={[
              'total',
              ['per-1m', 'total / capita'],
              // ['squared-per-1m', 'total² / capita']
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
              <span className="value">{numberWithCommas(current.results)}</span>
            </li>
            <li>
              <span className="label">Tests Positive</span>
              <span className="value">{numberWithCommas(current.positives)} or {percentWithPlaces(100*current.positiveRate, 2)}</span>
            </li>
            <li>
              <span className="label">Attack Rate</span>
              <span className="value">{percentWithPlaces(100*state.attackRate, 3)}</span>
            </li>
            <li>
              <span className="label">CFR</span>
              <span className="value">{percentWithPlaces(100* current.deathRate, 2)} (estimated)</span>
            </li>
            <li>
              <span className="label">Dead</span>
              <span className="value">{numberWithCommas(current.deaths)} or {withPlaces(currentPer1M.deaths, 2)}/million</span>
            </li>
            <li>
              <span className="label">Hospitalizations</span>
              <span className="value">{numberWithCommas(current.admissions) || "unknown"} cumulative</span>
            </li>
            <li>
              <span className="label"></span>
              <span className="value">{numberWithCommas(current.inHospital) || "unknown"} current</span>
            </li>
            <li>
              <span className="label"></span>
              <span className="value">{numberWithCommas(current.recovered) || "unknown"} recovered</span>
            </li>
            <li>  
              <span className="label"></span>
              <span className="value">{percentWithPlaces(current.admissionRate, 2) || "unknown"} total rate</span>
            </li>
            <li>
              <span className="label">In ICU</span>
              <span className="value">{numberWithCommas(current.inIcu) || "unknown"} currently</span>
            </li>
            <li>
              <span className="label">Ventilated</span>
              <span className="value">{numberWithCommas(current.ventilations) || "unknown"} cumulative</span>
            </li>
            <li>
              <span className="label"></span>
              <span className="value">{numberWithCommas(current.onVentilator) || "unknown"} currently</span>
            </li>
          </ul>
        </div>
      </div>
      <hr />
      <div className="charts">
        <div className="filters-container">
          <div className="filters">
            <Filter accessors={[chartType, setChartType]} options={[
              ['cumulative', 'total'],
              'daily',
              // 'daily-daily',
              ['daily-percent', '% daily change'],
            ]}/>
            <Filter accessors={[timeframe, setTimeframe]} options={[
              [null, 'all'],
              ['first-death', 'from first death'],
              // [21, 'last 21d'],
              // [14, 'last 14d'],
            ]}/>
            <Filter accessors={[averageDays, setAverageDays]} label="smoothing" options={[
              [1, 'none'],
              [2, '2 day'],
              [3, '3 day'],
            ]}/>
          </div>
        </div>

        <DailyNewPositivesChart 
          name={<span className="name">Positives</span>}
          data={chartData} 
          yTickFormatter={yTickFormatter}
        />
        <DeathHospitalizationChart name="Deaths and Hospitalizations"
          data={chartData} yTickFormatter={yTickFormatter}/>
        {/*<DailyChangesChart name="Tests & Results" series={chartData} />*/}
{/*        <PercentageTestResultsChart name="Test Results as % of Total Tests"
          series={chartData} basis="percentage"/>
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