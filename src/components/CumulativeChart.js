import PropTypes from 'prop-types';
import React from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
// import _ from 'lodash'
import "./CumulativeChart.css"

const POSITIVE_COLOR = 'pink'
const NEGATIVE_COLOR = 'green'
const DEATH_COLOR = 'red'

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
        <LineChart width={600} height={300} data={data}
                   margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
          >
          <Line 
            yAxisId="left"
            type="monotone"
            dataKey="positive"
            stroke={POSITIVE_COLOR}
            isAnimationActive={false}
            name="Positives"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="negative"
            stroke={NEGATIVE_COLOR}
            isAnimationActive={false}
            name="Negatives"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="death"
            stroke={DEATH_COLOR}
            isAnimationActive={false}
            name="Deaths"
          />
          <XAxis dataKey="displayDate" />
          <YAxis
            yAxisId="left"
            orientation="left"
            type="number"
            allowDataOverflow={false}
            domain={[0,1000]}
          />
          <Tooltip />
        </LineChart>
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