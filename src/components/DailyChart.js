import PropTypes from 'prop-types';
import React from "react"
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Colors from '../Colors.js'
import _ from 'lodash'
import "./DailyChart.css"

const percentDisplay = (num, n) => Number.parseFloat(num).toFixed(1)

class DailyChart extends React.Component {
  render() {
    let displayPerTotalConfirmed = percentDisplay(this.props.stats.perTotalConfirmed, 1)

    //CRZ: fix up data such that it displays nicely.
    let data = this.props.series.map((e, idx, a) => {
      let flooredPosPercToday = Math.max(0, e.posPercToday)

      e.displayPosPercToday = percentDisplay(flooredPosPercToday, 1)
      if(!_.isFinite(e.posPercToday)) { e.displayPosPercToday = null }

      e.displayDate = e.date.toString().slice(5, 6) + "-" + e.date.toString().slice(6, 8)

      return e
    })

    return (
      <div className="area-chart">
        <div className="header">
          <span className="name">
            {this.props.name}
          </span>
          <span className="totals">
            {this.props.stats.totalTests} tested; {this.props.stats.totalConfirmed}({displayPerTotalConfirmed}%) confirmed; {this.props.stats.totalDead} dead
          </span>
        </div>
        <ComposedChart width={600} height={300} data={data}
                   margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
          >
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
            yAxisId="percentage"
            type="linear"
            dataKey="displayPosPercToday"
            stroke={Colors.POSITIVE_PERCENT}
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
            name="% (+) Tests"
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

          <XAxis dataKey="displayDate" />
          <YAxis
            yAxisId="left"
            orientation="left"
            type="number"
            allowDataOverflow={false}
            domain={[0,1000]}
            tick={{stroke: Colors.TEST}}
          />
          <YAxis
            yAxisId="percentage"
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
  stats: PropTypes.object
}
DailyChart.defaultProps = {}

export default DailyChart