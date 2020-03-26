import PropTypes from 'prop-types';
import React from "react"
import { ComposedChart, CartesianGrid, Area, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Colors from '../Colors.js'
import { percentDisplay, percentTickFormatter, countTickFormatter, dateTickFormatter } from '../helpers/chartHelpers'
import _ from 'lodash'
import "./DailyChart.css"

const decorateSeriesForDisplay = (series) => {
  return series.map((e) => {
    e.displayPosPercToday = percentDisplay(Math.max(0, e.posPercToday), 1)
    if(!_.isFinite(e.posPercToday)) { e.displayPosPercToday = null }

    return e
  })
}

class DailyChart extends React.Component {
  render() {
    let displayTotalPerConfirmed = percentDisplay(this.props.totals.perConfirmed, 1)
    let data = decorateSeriesForDisplay(this.props.series)

    return (
      <div className="area-chart">
        <div className="header">
          <span className="name">
            {this.props.name}
          </span>
          <span className="totals">
            {this.props.totals.tests} tests; {this.props.totals.confirmed}({displayTotalPerConfirmed}%) positive; {this.props.totals.dead} dead
          </span>
        </div>
        <ComposedChart width={600} height={300} data={data}
                   margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
          >
          <CartesianGrid strokeDasharray="4 4" />
          <Area
            yAxisId="left"
            stackId="tested"
            dataKey="negativeDelta"
            stroke={Colors.NEGATIVE}
            fillOpacity={1}
            isAnimationActive={false}
            fill={Colors.NEGATIVE}
            name="Tested Negative"
          />
          <Area
            yAxisId="left"
            stackId="tested"
            dataKey="positiveDelta"
            stroke={Colors.POSITIVE}
            fillOpacity={1}
            isAnimationActive={false}
            fill={Colors.POSITIVE}
            name="Tested Positive"
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
            name="Test Pending"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="deathDelta"
            stroke={Colors.DEATH}
            strokeWidth={2}
            isAnimationActive={false}
            name="Deaths"
          />
          <Line 
            yAxisId="left"
            dataKey="posNegDelta"
            stroke={Colors.TEST}
            strokeWidth={2}
            isAnimationActive={false}
            name="# Tests"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="hospitalized"
            stroke={Colors.HOSPITALIZED}
            strokeWidth={2}
            isAnimationActive={false}
            name="Hospitalized"
          />
          <Line
            yAxisId="percentage"
            type="monotone"
            dataKey="displayPosPercToday"
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
          <Tooltip />
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