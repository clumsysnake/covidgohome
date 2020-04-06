import PropTypes from 'prop-types';
import React from "react"
import { ResponsiveContainer, ComposedChart, CartesianGrid, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Colors from '../helpers/Colors.js'
import { 
  tooltipFormatter,
  // percentDisplay, 
  // percentTickFormatter,
  countTickFormatter,
  dateTickFormatter 
} from '../helpers/chartHelpers'
import "./charts.css"

class DeathHospitalizationChart extends React.Component {
  render() {
    let yTickFormatter = this.props.yTickFormatter || countTickFormatter

    return (
      <div className="area-chart state-chart">
        <div className="header">
          <span className="name">
            {this.props.name}
          </span>
        </div>
        <ResponsiveContainer>
          <ComposedChart data={this.props.data} margin={{ top: 10, right: 0, left: 0, bottom: 10 }}>
            <Tooltip formatter={tooltipFormatter} labelFormatter={dateTickFormatter}/>
            <CartesianGrid strokeDasharray="4 4" />
            <Line
              yAxisId="left"
              type="linear"
              dataKey="deaths"
              stroke={Colors.DEATH}
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={200}
              name="Deaths"
            />
            <Line
              yAxisId="left"
              type="linear"
              dataKey="admissions"
              stroke={Colors.HOSPITALIZED}
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={200}
              name="Hospitalizations"
            />

            <XAxis
              dataKey="date"
              tickFormatter={dateTickFormatter}
              domain={this.props.xDomain}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={yTickFormatter}
              orientation="left"
              type="number"
              allowDataOverflow={false}
              domain={this.props.yDomain}
              tick={{stroke: Colors.TEST}}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

DeathHospitalizationChart.propTypes = {
  name: PropTypes.string,
  series: PropTypes.array,
  yDomain: PropTypes.array,
  xDomain: PropTypes.array,
}
DeathHospitalizationChart.defaultProps = {
  yDomain: ['auto', 'auto'],
  xDomain: ['dataMin', 'dataMax'],
}

export default DeathHospitalizationChart