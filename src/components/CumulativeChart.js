import PropTypes from 'prop-types';
import React from "react"
import { ComposedChart, Area, CartesianGrid, Line, XAxis, YAxis, Tooltip } from 'recharts';
import "./CumulativeChart.css"
import Colors from '../Colors.js'
import { percentDisplay, percentTickFormatter, countTickFormatter, xAxisDisplayDate } from '../helpers/chartHelpers'
import _ from 'lodash'

//TODO; lots of overlap with DailyChart here
const decorateSeriesForDisplay = (series) => {
  return series.map((e, idx, a) => {
    e.displayPosPerc = percentDisplay(Math.max(0, e.posPerc), 1)
    if(!_.isFinite(e.posPerc)) { e.displayPosPerc = null }

    e.displayDate = xAxisDisplayDate(e.date)

    return e
  })
}

class CumulativeChart extends React.Component {
  render() {
    let data = decorateSeriesForDisplay(this.props.series)

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
          <Tooltip />
          <Area
            yAxisId="left"
            stackId="tested"
            dataKey="negative"
            stroke={Colors.NEGATIVE}
            fillOpacity={1}
            isAnimationActive={false}
            fill={Colors.NEGATIVE}
            name="Tested Negative"
          />
          <Area
            yAxisId="left"
            stackId="tested"
            dataKey="positive"
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
            isAnimationActive={false}
            name="Test Pending"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="total"
            stroke={Colors.TEST}
            strokeWidth={2}
            isAnimationActive={false}
            name="# Tested"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="death"
            stroke={Colors.DEATH}
            strokeWidth={2}
            isAnimationActive={false}
            name="Deaths"
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
            strokeDasharray="3 2"
            dataKey="displayPosPerc"
            stroke={Colors.POSITIVE_PERCENT}
            dot={false}
            strokeWidth={1}
            isAnimationActive={false}
            name="% (+) Tests"
          />

          <XAxis dataKey="displayDate" />
          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={countTickFormatter}
            type="number"
            allowDataOverflow={false}
            domain={[0,this.props.domainMax]}
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
  domainMax: PropTypes.number
}
CumulativeChart.defaultProps = {}

export default CumulativeChart