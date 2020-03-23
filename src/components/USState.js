import React from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import _ from 'lodash'
import "./USState.css"

const PERCENTAGE_COLOR = 'green'
const COUNT_COLOR = 'sienna'

const percentDisplay = (num, n) => Number.parseFloat(num).toFixed(1)

class USState extends React.Component {
  render() {
    let state = this.props.state

    let displayPerTotalConfirmed = percentDisplay(state.perTotalConfirmed, 1)

    //CRZ: fix up data such that it displays nicely.
    let data = state.entries.map((e, idx, a) => {
      let flooredPosPercToday = Math.max(0, e.posPercToday)

      e.displayPosPercToday = percentDisplay(flooredPosPercToday, 1)
      if(!_.isFinite(e.posPercToday)) { e.displayPosPercToday = null }

      e.displayDate = e.date.toString().slice(5, 6) + "-" + e.date.toString().slice(6, 8)

      return e
    })

    return (
      <div className="us-state">
        <div className="us-state-header">
          <span className="state-code">
            {state.code}
          </span>
          <span className="state-totals">
            {state.totalTests} tested; {state.totalConfirmed}({displayPerTotalConfirmed}%) confirmed; {state.totalDead} dead
          </span>
        </div>
        <LineChart width={600} height={300} data={data}
                   margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
          >
          <Line 
            yAxisId="left"
            type="monotone"
            dataKey="posNegChange"
            stroke={COUNT_COLOR}
            strokeWidth={3}
            isAnimationActive={false}
            name="# Tests"
          />
          <Line
            yAxisId="percentage"
            type="monotone"
            dataKey="displayPosPercToday"
            stroke={PERCENTAGE_COLOR}
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
            tick={{stroke: COUNT_COLOR}}
          />
          <YAxis
            yAxisId="percentage"
            orientation="right"
            type="number"
            allowDataOverflow={false}
            domain={[0, 100]}
            tick={{stroke: PERCENTAGE_COLOR}}
          />
          <Tooltip />
        </LineChart>
      </div>
    )
  }
}

USState.propTypes = {
  //entries, array of covidtracking rows
}
USState.defaultProps = {}

export default USState