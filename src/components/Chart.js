import PropTypes from 'prop-types';
import React from "react"
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import Colors from '../helpers/Colors.js'
import { 
  tooltipFormatter,
  countTickFormatter,
  dateTickFormatter 
} from '../helpers/chartHelpers'
import "./charts.css"

export default function Chart(props) {
  let yTickFormatter = props.yTickFormatter || countTickFormatter

  let xAxis = props.xAxis || (
  	<XAxis
      dataKey="date"
      tickFormatter={dateTickFormatter}
      domain={props.xDomain}
    />
  )
  let yAxis = props.yAxis || (
	  <YAxis
	    yAxisId="left"
	    tickFormatter={yTickFormatter}
	    orientation="left"
	    type="number"
	    allowDataOverflow={false}
	    domain={props.yDomain}
	    tick={{stroke: Colors.TEST}}
	  />
  )

  return (
    <div className="area-chart state-chart">
      <div className="header">
        <span className="name">
          {props.name}
        </span>
      </div>
      <ResponsiveContainer>
        <ComposedChart data={props.data} margin={{ top: 10, right: 0, left: 0, bottom: 10 }}>
          <Tooltip formatter={tooltipFormatter} labelFormatter={dateTickFormatter}/>
          <CartesianGrid strokeDasharray="4 4" />
          {props.children}
          {xAxis}
          {yAxis}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

Chart.propTypes = {
  name: PropTypes.string,
  data: PropTypes.array,
  yDomain: PropTypes.array,
  xDomain: PropTypes.array,
}
Chart.defaultProps = {
  yDomain: ['auto', 'auto'],
  xDomain: ['dataMin', 'dataMax'],
}