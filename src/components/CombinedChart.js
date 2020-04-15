import PropTypes from 'prop-types';
import React from "react"
import { ResponsiveContainer, ComposedChart, CartesianGrid, Area, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Colors from '../helpers/Colors.js'
import { 
  percentTickFormatter,
  countTickFormatter,
  tooltipFormatter,
  percentDisplay, 
  dateTickFormatter 
} from '../helpers/chartHelpers'
import "./charts.css"

export default function CombinedChart(props) {
  return (
    <div className="area-chart">
      <div className="header">
        {props.name}
        {props.totals ? <span className="totals">
          {props.totals.results} tests; {props.totals.positives}({percentDisplay(100*props.totals.positiveRate, 1)}%) positive; {props.totals.deaths} dead
        </span> : null}
      </div>
      <ResponsiveContainer>
        <ComposedChart data={props.data} margin={{ top: 10, right: 0, left: 0, bottom: 10 }}>
          <Tooltip formatter={tooltipFormatter} labelFormatter={dateTickFormatter}/>
          <CartesianGrid strokeDasharray="4 4" />
          <Area
            yAxisId="left"
            stackId="tested"
            dataKey="negatives"
            stroke={Colors.NEGATIVE}
            fillOpacity={1}
            fill={Colors.NEGATIVE}
            name="Negatives"
            isAnimationActive={false}
          />
          <Area
            yAxisId="left"
            stackId="tested"
            dataKey="positives"
            stroke={Colors.POSITIVE}
            fillOpacity={1}
            fill={Colors.POSITIVE}
            name="Positives"
            isAnimationActive={false}
          />
          <Area
            stackId="tested"
            yAxisId="left"
            type="linear"
            dataKey="pending"
            stroke={Colors.PENDING}
            fill={Colors.PENDING}
            name="Outcome Pending"
            isAnimationActive={false}
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="deaths"
            stroke={Colors.DEATH}
            strokeWidth={2}
            dot={false}
            name="Deaths"
            isAnimationActive={false}
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="admissions"
            stroke={Colors.HOSPITALIZED}
            strokeWidth={2}
            dot={false}
            name="Hospitalizations"
            isAnimationActive={false}
          />
          <Line 
            yAxisId="left"
            dataKey="results"
            stroke={Colors.TEST}
            strokeWidth={1}
            dot={false}
            name="Total Tests"
            isAnimationActive={false}
          />
{/*            <Line
            yAxisId="percentage"
            type="monotone"
            strokeDasharray="3 2"
            dataKey="positiveRate"
            stroke={Colors.POSITIVE_PERCENT}
            dot={false}
            strokeWidth={1}
            name="% (+) Tests"
          />
*/}
          <XAxis
            dataKey="date"
            tickFormatter={dateTickFormatter}
            domain={props.xDomain}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={countTickFormatter}
            orientation="left"
            type="number"
            allowDataOverflow={false}
            domain={props.yDomain}
            tick={{stroke: Colors.TEST}}
          />
          <YAxis
            yAxisId="percentage"
            tickFormatter={percentTickFormatter}
            orientation="right"
            type="number"
            allowDataOverflow={false}
            domain={[0, 100]}
            tick={{stroke: Colors.POSITIVE_PERCENT}}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

CombinedChart.propTypes = {
  //TODO: now a component
  // name: PropTypes.string, 
  data: PropTypes.array,
  totals: PropTypes.object,
  yDomain: PropTypes.array,
  xDomain: PropTypes.array,
}
CombinedChart.defaultProps = {
  yDomain: ['auto', 'auto'],
  xDomain: ['dataMin', 'dataMax'],
}