import PropTypes from 'prop-types';
import React from "react"
import { ComposedChart, CartesianGrid, Area, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Colors from '../helpers/Colors.js'
import { 
  tooltipFormatter,
  countTickFormatter,
  dateTickFormatter 
} from '../helpers/chartHelpers'
import "./charts.css"

function DailyChart(props) {
  let data = props.series

  return (
    <div className="area-chart">
      <div className="header">
        <span className="name">
          {props.name}
        </span>
      </div>
      <ComposedChart width={600} height={300} data={data}
                 margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
        >
        <Tooltip formatter={tooltipFormatter} labelFormatter={dateTickFormatter}/>
        <CartesianGrid strokeDasharray="4 4" />
        <Area
          yAxisId="left"
          stackId="tested"
          dataKey="negativeDelta"
          stroke={Colors.NEGATIVE}
          fillOpacity={1}
          isAnimationActive={false}
          fill={Colors.NEGATIVE}
          name="Negatives"
        />
        <Area
          yAxisId="left"
          stackId="tested"
          dataKey="positiveDelta"
          stroke={Colors.POSITIVE}
          fillOpacity={1}
          isAnimationActive={false}
          fill={Colors.POSITIVE}
          name="Positives"
        />
        <Area
          stackId="tested"
          yAxisId="left"
          type="linear"
          dataKey="pending"
          stroke={Colors.PENDING}
          fill={Colors.PENDING}
          strokeWidth={0}
          isAnimationActive={false}
          name="Outcome Pending"
        />
        <Line 
          yAxisId="left"
          dataKey="posNegDelta"
          stroke={Colors.TEST}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          name="Tests Completed w/ Results"
        />

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
      </ComposedChart>
    </div>
  )
}

DailyChart.propTypes = {
  name: PropTypes.string,
  series: PropTypes.array,
  totals: PropTypes.object,
  yDomain: PropTypes.array,
  xDomain: PropTypes.array,
}
DailyChart.defaultProps = {
  yDomain: ['auto', 'auto'],
  xDomain: ['dataMin', 'dataMax'],
}

export default DailyChart