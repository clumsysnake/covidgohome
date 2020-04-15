import _ from 'lodash'
import React, { useState } from 'react'
import { Line, Legend, Bar, YAxis } from 'recharts'
import C from '../components.js'
import Colors from '../helpers/Colors'
import * as H from '../helpers/chartHelpers.js'

export default function AreaIsoCharts(props) {
  const [chartType, setChartType] = useState('daily')
  const [timeframe, setTimeframe] = useState('first-death')
  const [averageDays, setAverageDays] = useState(1)

  let area = props.area
  let transform = area.series.transform()

  let yTickFormatter, chartData, chartSuffix
  switch(chartType) {
    case 'cumulative': chartData = transform.average(averageDays).frames; break;
    case 'daily':
      chartData = transform.deltize().average(averageDays).frames;
      yTickFormatter = H.countChangeFormatter
      chartSuffix = "daily change"
      break;
    case 'daily-percent':
      chartData = transform.deltaPercentize().average(averageDays).frames
      yTickFormatter = H.percentChangeFormatter
      chartSuffix = "daily change %"
      break;
    default: 
      throw new Error(`chart type ${chartType} unknown`)
  }

  //TODO: this takes work... i can't have BOTH a positiveRate for just its day AND over all 
  //      days in one transform such that i get one set of frames. so i have to manually
  //      combine. i could just add positiveRate and positiveRateTotal... but those are subject
  //      to transforms? Rates could just NOT be subject to transforms and I could add all the
  //      ones i need....or a Transform#combine...?
  let testResultsData = area.series.ratesScale(100).frames
  let deltaFrames = area.series.deltize().ratesScale(100).frames
  testResultsData.forEach((f, idx) => {
    Object.assign(f, {
      positiveRateDelta: deltaFrames[idx].positiveRate,
      resultsDelta: deltaFrames[idx].results
    })
  })

  let index = 0
  if(_.isInteger(timeframe)) {
    index = Math.max(chartData.length - timeframe, 0)
  } else if(timeframe === 'first-death') {
    index = chartData.findIndex(f => f.deaths > 0 )
  }

  chartData = chartData.slice(index)
  testResultsData.slice(index)

  function suffixed(name) {
    return chartSuffix ? `${name} (${chartSuffix})` : name
  }

	return (
	  <div className="charts">
	    <div className="filters-container">
	      <div className="filters">
	        <C.Filter accessors={[chartType, setChartType]} options={[
	          ['cumulative', 'total'],
	          'daily',
	          // 'daily-daily',
	          ['daily-percent', '% daily change'],
	        ]}/>
	        <C.Filter accessors={[timeframe, setTimeframe]} options={[
	          [null, 'all'],
	          ['first-death', 'from first death'],
	          // [14, 'last 14d'],
	        ]}/>
	        <C.Filter accessors={[averageDays, setAverageDays]} label="smoothing" options={[
	          [1, 'none'],
	          [2, '2 day'],
	          [3, '3 day'],
	        ]}/>
	      </div>
	    </div>
	    <C.Chart name={suffixed("Positives")} data={chartData} yTickFormatter={yTickFormatter}>
	      <Line
	        yAxisId="left"
	        type="linear"
	        dataKey="positives"
	        stroke={Colors.POSITIVE}
	        strokeWidth={2}
	        dot={false}
	        isAnimationActive={true}
	        animationDuration={200}
	        name="Positives"
	      />  
	    </C.Chart>
	    <C.Chart name={suffixed("Deaths and New Hospital Admissions")}
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
	        name="Hospital Admissions"
	      />
	      <Legend />
	    </C.Chart>
	    <C.Chart name={suffixed("Currently Hospitalized")}
	      data={chartData} yTickFormatter={yTickFormatter}>
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
	    </C.Chart>
	    <C.Chart name="Positive % vs # of Tests" 
	           data={testResultsData} yTickFormatter={H.percentTickFormatter}>
	      <Bar
	        yAxisId="right"
	        dataKey="resultsDelta"
	        type="linear"
	        opacity={0.3}
	        stroke={Colors.TEST}
	        isAnimationActive={true}
	        animationDuration={200}
	        name="# Test Results"
	      />
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
	        dataKey="positiveRateDelta"
	        stroke={"red"}
	        strokeDasharray="3 2"
	        strokeWidth={1}
	        dot={false}
	        isAnimationActive={true}
	        animationDuration={200}
	        name="Test Pos. % for Day"
	      />
	      <YAxis
	        yAxisId="right"
	        tickFormatter={H.countTickFormatter}
	        orientation="right"
	        type="number"
	        allowDataOverflow={false}
	        domain={props.yDomain}
	        tick={{stroke: "grey"}}
	      />
	      <Legend />
	    </C.Chart>
    </div>
	  )
}