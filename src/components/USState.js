import React from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import _ from 'lodash'
import "./USState.css"

const PERCENTAGE_COLOR = 'green'
const COUNT_COLOR = 'sienna'

class USState extends React.Component {
  stateCode() {
    return this.props.entries[0].state
  }

  render() {
    //CRZ: fix up data such that it displays nicely.
    let data = this.props.entries.map((e, idx, a) => {
      let flooredPosPercToday = Math.max(0, e.posPercToday)

      e.displayPosPercToday = Number.parseFloat(flooredPosPercToday).toFixed(0)
      if(!_.isFinite(e.posPercToday)) { e.displayPosPercToday = null }

      e.displayDate = e.date.toString().slice(5, 6) + "-" + e.date.toString().slice(6, 8)

      return e
    })

    const totalTests = _.last(data).total
    const totalConfirmed = _.last(data).positive
    const perTotalConfirmed = Number.parseFloat(100 * totalConfirmed / totalTests).toFixed(0)
    const totalDead = _.last(data).death || 0

    return (
      <div className="us-state">
        <div className="us-state-header">
          <span className="state-code">
            {this.stateCode()}
          </span>
          <span className="state-totals">
            {totalTests} tested; {totalConfirmed}({perTotalConfirmed}%) confirmed;  {totalDead} dead
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
          <XAxis dataKey="displayDate" domain={this.props.globalXDomain} />
          <Tooltip />
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
          {/*<Legend />*/}
        </LineChart>
      </div>
    )
  }
}

USState.propTypes = {
  //entries, array of covidtracking rows
  //globalXDomain
}
USState.defaultProps = {}
export default USState