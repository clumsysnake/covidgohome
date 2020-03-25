import PropTypes from 'prop-types';
import React from "react"
import { ComposedChart, LinearGradient, Area, CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
// import _ from 'lodash'
import "./CumulativeChart.css"

const POSITIVE_COLOR = 'pink'
const NEGATIVE_COLOR = 'green'
const DEATH_COLOR = 'red'
const TEST_COLOR = 'sienna'

// const percentDisplay = (num, n) => Number.parseFloat(num).toFixed(1)

class CumulativeChart extends React.Component {
  render() {
    let data = this.props.series.map((e, idx, a) => {
      e.displayDate = e.date.toString().slice(5, 6) + "-" + e.date.toString().slice(6, 8)

      return e
    })

    return (
      <div className="cumulative-chart">
        <div className="header">
          <span className="name">
            {this.props.name}
          </span>
        </div>

        <ComposedChart width={600} height={300} data={data}
                   margin={{ top: 10, right: 5, left: 5, bottom: 10 }}>
          <XAxis dataKey="displayDate" />
          <YAxis
            yAxisId="left"
            orientation="left"
            type="number"
            allowDataOverflow={false}
            domain={[0,1000]}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            yAxisId="left"
            stackId="tested"
            dataKey="negative"
            stroke={NEGATIVE_COLOR}
            fillOpacity={1}
            isAnimationActive={false}
            fill={NEGATIVE_COLOR}
            name="Tested Negative"
          />
          <Area
            yAxisId="left"
            stackId="tested"
            dataKey="positive"
            stroke={POSITIVE_COLOR}
            fillOpacity={1}
            isAnimationActive={false}
            fill={POSITIVE_COLOR}
            name="Tested Positive"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="total"
            stroke={TEST_COLOR}
            strokeWidth={2}
            isAnimationActive={false}
            name="# Tested"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="death"
            stroke={DEATH_COLOR}
            strokeWidth={2}
            isAnimationActive={false}
            name="Deaths"
          />
        </ComposedChart>
      </div>
    )
  }
}

CumulativeChart.propTypes = {
  name: PropTypes.string,
  series: PropTypes.array
}
CumulativeChart.defaultProps = {}

export default CumulativeChart