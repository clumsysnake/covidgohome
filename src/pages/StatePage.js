import React, {useState} from 'react'
import ReactTooltip from 'react-tooltip'
import { connect } from 'react-redux'
import { Line, Legend } from 'recharts'
import Chart from '../components/Chart'
import Colors from '../helpers/Colors'
// import DailyChangesChart from '../components/DailyChangesChart.js'
import DailyNewPositivesChart from '../components/DailyNewPositivesChart.js'
import PercentageTestResultsChart from '../components/PercentageTestResultsChart.js'
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
  let transform = state.series.transform()

  let yTickFormatter, chartData
  switch(chartType) {
    case 'cumulative': chartData = transform.average(averageDays).frames; break;
    case 'daily': chartData = transform.deltize().average(averageDays).frames; break;
    // case 'daily-daily': chartData = transform.deltize().deltize().average(averageDays).frames; break;
    case 'daily-percent':
      chartData = transform.deltaPercentize().average(averageDays).frames
      yTickFormatter = percentTickFormatter
      break;
    default: 
      throw new Error(`chart type ${chartType} unknown`)
  }

  //TODO: this takes work... i can't have BOTH a positiveRate for just its day AND over all 
  //      days in one transform such that i get one set of frames. so i have to manually
  //      combine. i could just add positiveRate and positiveRateTotal... but those are subject
  //      to transforms? Rates could just NOT be subject to transforms and I could add all the
  //      ones i need....or a Transform#combine...?
  let posPercFrames = state.series.ratesScale(100).frames
  let deltaFrames = state.series.deltize().ratesScale(100).frames
  posPercFrames.forEach((f, idx) => f.positiveRateDaily = deltaFrames[idx].positiveRate)

  let index = 0
  if(_.isInteger(timeframe)) {
    index = Math.max(chartData.length - timeframe, 0)
  } else if(timeframe === 'first-death') {
    index = chartData.findIndex(f => f.deaths > 0 )
  }

  chartData = chartData.slice(index)
  posPercFrames.slice(index)
  
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
              ['per-1m', 'total/capita'],
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
              <span className="value">{percentWithPlaces(current.admissionRate, 2) || "unknown"} admission rate</span>
            </li>
            <li>  
              <span className="label"></span>
              <span className="value">{numberWithCommas(current.admissions) || "unknown"} cumulative</span>
            </li>
            <li>
              <span className="label"></span>
              <span className="value">{numberWithCommas(current.inHospital) || "unknown"} currently</span>
            </li>
            <li>
              <span className="label"></span>
              <span className="value">{numberWithCommas(current.recovered) || "unknown"} recovered</span>
            </li>
            <li>
              <span className="label">In ICU</span>
              <span className="value">{numberWithCommas(current.inICU) || "unknown"} currently</span>
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
          yTickFormatter={yTickFormatter}>
          <Legend />
        </DailyNewPositivesChart>
        <Chart name="Cumulative Deaths and Hospitalizations"
               data={chartData} yTickFormatter={yTickFormatter}>
          <Line
            yAxisId="left"
            type="linear"
            dataKey="deaths"
            stroke={Colors.DEATH}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={200}
            name="Deaths"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="admissions"
            stroke={Colors.HOSPITALIZED}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={200}
            name="Hospitalizations"
          />
          <Legend />
        </Chart>
        <Chart name="Currently Hospitalized" data={chartData}>
          <Line
            yAxisId="left"
            type="linear"
            dataKey="inHospital"
            stroke={Colors.HOSPITALIZED}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={200}
            name="in Hospital"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="inICU"
            stroke={Colors.ICU}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={200}
            name="in ICU"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="onVentilator"
            stroke={Colors.VENT}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={200}
            name="on Ventilator"
          />
          <Legend />
        </Chart>
        {/*<DailyChangesChart name="Tests & Results" series={chartData} />*/}
        <Chart name="Test Positive %" 
               data={posPercFrames} yTickFormatter={percentTickFormatter}>
          <Line
            yAxisId="left"
            type="linear"
            dataKey="positiveRate"
            stroke={Colors.POSITIVE_PERCENT}
            strokeDasharray="3 2"
            strokeWidth={1}
            dot={false}
            isAnimationActive={true}
            animationDuration={200}
            name="Test Pos. % Cumulative"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="positiveRateDaily"
            stroke={"red"}
            strokeDasharray="3 2"
            strokeWidth={1}
            dot={false}
            isAnimationActive={true}
            animationDuration={200}
            name="Test Pos. % for Day"
          />
          <Legend />
        </Chart>
     </div>
    </div>
  )
}

function mapStateToProps(state, ownProps) {
  let abbrev = ownProps.match.params.stateAbbrev
  return {state: state.states.find(s => s.abbreviation.toUpperCase() === abbrev)}
}

export default connect(mapStateToProps)(StatePage)