import PropTypes from 'prop-types';
import React from "react"
import { ComposedChart, Area, CartesianGrid, Line, XAxis, YAxis, Tooltip } from 'recharts';
import "./CumulativeChart.css"
import Colors from '../Colors.js'
import { 
  percentTickFormatter, 
  countTickFormatter, 
  dateTickFormatter,
  tooltipFormatter
} from '../helpers/chartHelpers'

class CumulativeChart extends React.Component {
  render() {
    let data = this.props.series

    return (
      <div className="cumulative-chart">
        <div className="header">
          <span className="name">
            {this.props.name}
          </span>
        </div>

        <ComposedChart width={600} height={300} data={data}
                   margin={{ top: 10, right: 5, left: 5, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip formatter={tooltipFormatter}/>
          <Area
            yAxisId="left"
            stackId="tested"
            dataKey="negative"
            stroke={Colors.NEGATIVE}
            fillOpacity={1}
            isAnimationActive={false}
            fill={Colors.NEGATIVE}
            name="Negative"
          />
          <Area
            yAxisId="left"
            stackId="tested"
            dataKey="positive"
            stroke={Colors.POSITIVE}
            fillOpacity={1}
            isAnimationActive={false}
            fill={Colors.POSITIVE}
            name="Positive"
          />
          <Area
            stackId="tested"
            yAxisId="left"
            type="linear"
            dataKey="pending"
            stroke={Colors.PENDING}
            fill={Colors.PENDING}
            isAnimationActive={false}
            name="Outcome Pending"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="death"
            stroke={Colors.DEATH}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Deaths"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="hospitalized"
            stroke={Colors.HOSPITALIZED}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Hospitalized"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="total"
            stroke={Colors.TEST}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="# Tests"
          />
          <Line
            yAxisId="percentage"
            type="monotone"
            strokeDasharray="3 2"
            dataKey="posPerc"
            stroke={Colors.POSITIVE_PERCENT}
            dot={false}
            strokeWidth={1}
            isAnimationActive={false}
            name="% (+) Tests"
          />

          <XAxis
            dataKey="date"
            tickFormatter={dateTickFormatter}
            type="number"
            domain={this.props.xDomain}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={countTickFormatter}
            type="number"
            allowDataOverflow={false}
            domain={this.props.yDomain}
            tick={{stroke: Colors.TEST}}
          />
          <YAxis
            yAxisId="percentage"
            orientation="right"
            tickFormatter={percentTickFormatter}
            type="number"
            allowDataOverflow={false}
            domain={[0, 100]}
            tick={{stroke: Colors.POSITIVE_PERCENT}}
          />
        </ComposedChart>
      </div>
    )
  }
}

CumulativeChart.propTypes = {
  name: PropTypes.string,
  series: PropTypes.array,
  yDomain: PropTypes.array,
  xDomain: PropTypes.array,
  scale: PropTypes.number
}
CumulativeChart.defaultProps = {
  yDomain: ['auto', 'auto'],
  xDomain: ['auto', 'auto'],
  scale: 1
}

export default CumulativeChart