import PropTypes from 'prop-types';
import React from "react"
import { ResponsiveContainer, ComposedChart, CartesianGrid, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Colors from '../helpers/Colors.js'
import { tooltipFormatter, countTickFormatter, dateTickFormatter } from '../helpers/chartHelpers'
import "./charts.css"

function DailyNewPositivesChart(props) {
  let data = props.series

  let yTickFormatter = props.yTickFormatter || countTickFormatter

  return (
    <div className="area-chart">
      <div className="header">
        <span className="name">
          {props.name}
        </span>
      </div>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 10 }}>
          <Tooltip formatter={tooltipFormatter} labelFormatter={dateTickFormatter}/>
          <CartesianGrid strokeDasharray="4 4" />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="positiveDelta"
            stroke={Colors.POSITIVE}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={200}
            name="New Positives"
          />
          <XAxis
            dataKey="date"
            tickFormatter={dateTickFormatter}
            domain={props.xDomain}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={yTickFormatter}
            orientation="left"
            type="number"
            allowDataOverflow={false}
            domain={props.yDomain}
            tick={{stroke: Colors.TEST}}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

DailyNewPositivesChart.propTypes = {
  name: PropTypes.string,
  series: PropTypes.array,
  yDomain: PropTypes.array,
  xDomain: PropTypes.array,
  // yTickFormatter
}
DailyNewPositivesChart.defaultProps = {
  yDomain: ['auto', 'auto'],
  xDomain: ['dataMin', 'dataMax'],
}

export default DailyNewPositivesChart