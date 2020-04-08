import _ from 'lodash'
import moment from 'moment'
import React, { useState } from 'react';
import {connect} from "react-redux"
import StateModel from '../models/StateModel'
import AreaModel from '../models/AreaModel'
import { UsStateMapping } from '../stores/CensusStore'

function SourcesPage(props) {
  // {props.ctStates && props.ctStates.map(k => <div>{k}</div>)}
  if(_.isEmpty(props.nytStates) || _.isEmpty(props.ctStates)) { return null }

  let states = UsStateMapping.map(mapping => {
    let nytSeries = _.sortBy(props.nytStates.filter(x => x.state === mapping.name), 'date')
    let ctState = StateModel.findByAbbrev(mapping.abbreviation)

    if(!ctState || _.isEmpty(nytSeries)) { return null }

    return {
      name: mapping.name,
      abbreviation: mapping.abbreviation,
      nytSeries,
      ctFrames: ctState.series.frames
    }
  })

  states = _.compact(states)


  const suspectedMissingDay = (e) => {
    return AreaModel.deltaStats.every(s => e[s] === 0) && e.positive > 100
  }

  let stateReports = states.map(s => {
    let zeroDeltaFrames = s.ctFrames.filter(suspectedMissingDay)
    // debugger
    return Object.assign({}, s, {
      zeroDeltaMapping: zeroDeltaFrames.map(e => {
        return {
          ct: e,
          nyt: s.nytSeries.find(nyt => e.date === nyt.date)
        }
      })
    })
  })

  return <div>
    {stateReports.filter(s => s.zeroDeltaMapping.length > 0).map(s => <div key={s.name}>
      {s.name} 
        <ul>
          {s.zeroDeltaMapping.map((map) => (
            <li key={s.name + map.ct.date}>
              <div>ct -> nyt, {moment.unix (map.ct.date).format('YYYY-MM-DD')}</div>
              <div>positives: {map.ct.positive} -> {map.nyt.cases}</div>
              <div>deaths: {map.ct.death} -> {map.nyt.deaths}</div>
            </li>
          ))}
        </ul>
      </div>)}
  </div>
}

const mapStateToProps = (state, ownProps) => ({
  nytStates: state.nyt.states,
  ctStates: state.states
})

export default connect(mapStateToProps)(SourcesPage)
