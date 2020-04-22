import React, { useState } from 'react';
import { Link } from "react-router-dom";
import {connect} from "react-redux"
import C from '../components.js'
import M from '../models.js'
import * as H from '../helpers/chartHelpers.js'
import "./TablesPage.css"

function TablesPage(props) {
  const [entity, setEntity] = useState('csa')
  const [sort, setSort] = useState('most-positives')

  let table
  if(entity === "csa") {
    let models = M.SAModel.all.filter(x => x.type === 'CSA')
    let areas = models.map(x => x.createAreaAggregate())
    areas.sort(M.AreaModel.sortFunction(sort))
    table = <SATable sas={models} areas={areas} />
  } else {
    let models = M.StateModel.all
    models.sort(M.AreaModel.sortFunction(sort))
    table = <StateTable states={models} />
  }

  return (
    <div className="tables-page">
      <div className="filters">
        <C.Filter accessors={[entity, setEntity]} options={['csa', 'state']} />
      </div>

      {table}
    </div>
  )
}

function SATable(props) {
  return (
    <div className="table">
      <div>Name</div>
      <div>Population</div>
      <div>Positives</div>
      <div>Positives/1m</div>
      <div>Deaths</div>
      <div>Deaths/1m</div>

      {props.areas.map ((a, i) => {
        let url = "/country/usa/csa/" + props.sas[i].code
        let last1M = a.series.scale(1000000/a.population).last
        let last = a.lastFrame
        return <React.Fragment>
          <div className="name"><Link to={url}>{a.name}</Link></div>
          <div className="population">{a.population}</div>
          <div className="positives">{last && last.positives}</div>
          <div className="positive/1m">{last1M && H.safeSmartNumPlaces(last1M.positives)}</div>
          <div className="deaths">{last && last.deaths}</div>
          <div className="deaths/1m">{last1M && H.safeSmartNumPlaces(last1M.deaths)}</div>
        </React.Fragment>
      })}
    </div>
  )
}

function StateTable(props) {
  return (
    <div className="table">
      <div>Name</div>
      <div>Population</div>
      <div>Positives</div>
      <div>Positives/1m</div>
      <div>Deaths</div>
      <div>Deaths/1m</div>

      {props.states.map ((a, i) => {
        let url = "/state/csa/" + a.code
        return <React.Fragment>
          <div className="name"><Link to={url}>{a.name}</Link></div>
          <div className="population">{a.population}</div>
          <div className="positives">{a.lastFrame && a.lastFrame.positives}</div>
          <div className="positive/1m">{a.lastFrame && H.safeSmartNumPlaces(a.lastFrame.positives)}</div>
          <div className="deaths">{a.lastFrame && a.lastFrame.deaths}</div>
          <div className="deaths/1m">{a.lastFrame && H.safeSmartNumPlaces(a.lastFrame.deaths)}</div>
        </React.Fragment>
      })}
    </div>
  )
}


function mapStateToProps(state, ownProps) {  
  return {
    //retrigger when counties are loaded.
    counties: M.CountyModel.all.length
  }
}

export default connect(mapStateToProps)(TablesPage)