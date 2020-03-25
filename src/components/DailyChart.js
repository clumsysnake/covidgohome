import PropTypes from 'prop-types';
import React from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import _ from 'lodash'
import "./DailyChart.css"

const TEST_COLOR = 'sienna'
const POSITIVE_COLOR = 'pink'

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
        <LineChart width={600} height={300} data={data}
                   margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
          >
          <Line 
            yAxisId="left"
            type="monotone"
            dataKey="posNegChange"
            stroke={TEST_COLOR}
            strokeWidth={2}
            isAnimationActive={false}
            name="# Tests"
          />
          <Line
            yAxisId="percentage"
            type="monotone"
            dataKey="displayPosPercToday"
            stroke={POSITIVE_COLOR}
            strokeWidth={2}
            isAnimationActive={false}
            name="% (+) Tests"
          />
          <XAxis dataKey="displayDate" />
          <YAxis
            yAxisId="left"
            orientation="left"
            type="number"
            allowDataOverflow={false}
            domain={[0,1000]}
            tick={{stroke: TEST_COLOR}}
          />
          <YAxis
            yAxisId="percentage"
            orientation="right"
            type="number"
            allowDataOverflow={false}
            domain={[0, 100]}
            tick={{stroke: POSITIVE_COLOR}}
          />
          <Tooltip />
        </LineChart>
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