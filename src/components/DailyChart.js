import PropTypes from 'prop-types';
import React from "react"
import { ResponsiveContainer, ComposedChart, CartesianGrid, Area, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Colors from '../helpers/Colors.js'
import { 
  tooltipFormatter,
  percentDisplay, 
  percentTickFormatter,
  countTickFormatter,
  dateTickFormatter 
} from '../helpers/chartHelpers'
import "./charts.css"

class DailyChart extends React.Component {
  render() {
    let data = this.props.series

    return (
      <div className="area-chart">
        <div className="header">
          {this.props.name}
          {this.props.totals ? <span className="totals">
            {this.props.totals.total} tests; {this.props.totals.positive}({percentDisplay(this.props.totals.positivePercent, 1)}%) positive; {this.props.totals.death} dead
          </span> : null}
        </div>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 10 }}>
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
              dataKey="hospitalizedDelta"
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
              strokeWidth={1}
              dot={false}
              isAnimationActive={false}
              name="Total Tests"
            />
            <Line
              yAxisId="percentage"
              type="monotone"
              strokeDasharray="3 2"
              dataKey="positivePercentDelta"
              stroke={Colors.POSITIVE_PERCENT}
              dot={false}
              strokeWidth={1}
              isAnimationActive={false}
              name="% (+) Tests"
            />

            <XAxis
              dataKey="date"
              tickFormatter={dateTickFormatter}
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
        </ResponsiveContainer>
      </div>
    )
  }
}

DailyChart.propTypes = {
  //TODO: now a component
  // name: PropTypes.string, 
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