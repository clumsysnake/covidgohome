import PropTypes from 'prop-types';
import React from "react"
import { ComposedChart, CartesianGrid, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Colors from '../helpers/Colors.js'
import { 
  tooltipFormatter,
  // percentDisplay, 
  // percentTickFormatter,
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
          <span className="name">
            {this.props.name}
          </span>
        </div>
        <ComposedChart width={600} height={300} data={data}
                   margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
          >
          <Tooltip formatter={tooltipFormatter} labelFormatter={dateTickFormatter}/>
          <CartesianGrid strokeDasharray="4 4" />
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
        </ComposedChart>
      </div>
    )
  }
}

DailyChart.propTypes = {
  name: PropTypes.string,
  series: PropTypes.array,
  yDomain: PropTypes.array,
  xDomain: PropTypes.array,
}
DailyChart.defaultProps = {
  yDomain: ['auto', 'auto'],
  xDomain: ['dataMin', 'dataMax'],
}

export default DailyChart