import PropTypes from 'prop-types';
import React from "react"
import { ComposedChart, CartesianGrid, Area, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Colors from '../Colors.js'
import { 
  tooltipFormatter,
  percentDisplay, 
  percentTickFormatter,
  countTickFormatter,
  dateTickFormatter 
} from '../helpers/chartHelpers'
import "./DailyChart.css"

class DailyChart extends React.Component {
  render() {
    let displayTotalPerConfirmed = percentDisplay(this.props.totals.perConfirmed, 1)
    let data = this.props.series

    return (
      <div className="area-chart">
        <div className="header">
          <span className="name">
            {this.props.name}
          </span>
          <span className="totals">
            {this.props.totals.total} tests; {this.props.totals.confirmed}({displayTotalPerConfirmed}%) positive; {this.props.totals.dead} dead
          </span>
        </div>
        <ComposedChart width={600} height={300} data={data}
                   margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
          >
          <Tooltip formatter={tooltipFormatter}/>
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
            type="linear"
            dataKey="deathDelta"
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
            name="Hospitalizations"
          />
          <Line 
            yAxisId="left"
            dataKey="posNegDelta"
            stroke={Colors.TEST}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Total Tests"
          />
          <Line
            yAxisId="percentage"
            type="monotone"
            dataKey="posPerc"
            stroke={Colors.POSITIVE_PERCENT}
            strokeDasharray="3 2"
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
            tickFormatter={countTickFormatter}
            orientation="left"
            type="number"
            allowDataOverflow={false}
            domain={this.props.yDomain}
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
      </div>
    )
  }
}

DailyChart.propTypes = {
  name: PropTypes.string,
  series: PropTypes.array,
  stats: PropTypes.object,
  yDomain: PropTypes.array,
  xDomain: PropTypes.array,
  scale: PropTypes.number
}
DailyChart.defaultProps = {
  yDomain: ['auto', 'auto'],
  xDomain: ['auto', 'auto'],
  scale: 1
}

export default DailyChart