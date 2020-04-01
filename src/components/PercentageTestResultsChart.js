import PropTypes from 'prop-types';
import React from "react"
import { ComposedChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import "./charts.css"
import Colors from '../helpers/Colors.js'
import { 
  percentTickFormatter, 
  dateTickFormatter,
  tooltipFormatter,
} from '../helpers/chartHelpers'

function PercentageTestResultsChart(props) {
  let data = props.series

  return (
    <div className="area-chart">
      <div className="header">
        <span className="name">
          {props.name}
        </span>
      </div>

      <ComposedChart width={600} height={300} data={data}
                 margin={{ top: 10, right: 5, left: 5, bottom: 10 }}>
        <Tooltip formatter={tooltipFormatter}/>
        <Area
          stackId="tested"
          dataKey="negative"
          stroke={Colors.NEGATIVE}
          fillOpacity={1}
          isAnimationActive={false}
          fill={Colors.NEGATIVE}
          name="Negatives"
        />
        <Area
          stackId="tested"
          dataKey="positive"
          stroke={Colors.POSITIVE}
          fillOpacity={1}
          isAnimationActive={false}
          fill={Colors.POSITIVE}
          name="Positives"
        />
        <Area
          stackId="tested"
          type="linear"
          dataKey="pending"
          stroke={Colors.PENDING}
          fill={Colors.PENDING}
          isAnimationActive={false}
          name="Outcome Pending"
        />

        <XAxis
          dataKey="date"
          tickFormatter={dateTickFormatter}
          type="number"
          domain={props.xDomain}
        />
        <YAxis
          orientation="left"
          tickFormatter={percentTickFormatter}
          type="number"
          allowDataOverflow={true}
          domain={[0, 100]}
          tick={{stroke: Colors.POSITIVE_PERCENT}}
        />
      </ComposedChart>
    </div>
  )
}

PercentageTestResultsChart.propTypes = {
  name: PropTypes.string,
  series: PropTypes.array,
  totals: PropTypes.object,
  yDomain: PropTypes.array,
  xDomain: PropTypes.array,
}
PercentageTestResultsChart.defaultProps = {
  yDomain: [0, 100],
  xDomain: ['dataMin', 'dataMax'],
}

export default PercentageTestResultsChart