import PropTypes from 'prop-types';
import React from "react"
import { ComposedChart, Area, CartesianGrid, Line, XAxis, YAxis, Tooltip } from 'recharts';
import "./charts.css"
import Colors from '../helpers/Colors.js'
import { 
  percentTickFormatter, 
  countTickFormatter, 
  dateTickFormatter,
  tooltipFormatter,
  percentDisplay
} from '../helpers/chartHelpers'

class CumulativeChart extends React.Component {
  render() {
    let data = this.props.series

    return (
      <div className="area-chart">
        <div className="header">
          <span className="name">
            {this.props.name}
          </span>
          {this.props.totals ? <span className="totals">
            {this.props.totals.total} tests; {this.props.totals.positive}({percentDisplay(this.props.totals.positivePercent, 1)}%) positive; {this.props.totals.death} dead
          </span> : null}
        </div>

        <ComposedChart width={600} height={300} data={data}
                   margin={{ top: 10, right: 5, left: 5, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip formatter={tooltipFormatter} labelFormatter={dateTickFormatter}/>
          <Area
            yAxisId="left"
            stackId="tested"
            dataKey="negative"
            stroke={Colors.NEGATIVE}
            fillOpacity={1}
            isAnimationActive={false}
            fill={Colors.NEGATIVE}
            name="Negatives"
          />
          <Area
            yAxisId="left"
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
            dataKey="hospitalizedCumulative"
            stroke={Colors.HOSPITALIZED}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Hospitalizations"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="total"
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
            dataKey="positivePercent"
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
  totals: PropTypes.object,
  yDomain: PropTypes.array,
  xDomain: PropTypes.array,
}
CumulativeChart.defaultProps = {
  yDomain: ['auto', 'auto'],
  xDomain: ['dataMin', 'dataMax'],
}

export default CumulativeChart