import _ from '../lodash'
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import {connect} from "react-redux"
import C from '../components.js'
import M from '../models.js'
import * as H from '../helpers/chartHelpers.js'
import "./TablesPage.css"

function TablesPage(props) {
  const [entity, setEntity] = useState('csa')

  if(props.counties.length === 0) { return null }

  let table
  if(entity === "csa") {
    let models = M.SAModel.all.filter(x => x.type === 'CSA')
    models.sort((a, b) => M.AreaModel.sortFunction('most-positives')(a.area, b.area))
    table = <SATable sas={models} />
  } else {
    let models = M.StateModel.all
    models.sort(M.AreaModel.sortFunction('most-positives'))
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
  let totalArea = M.AreaModel.createAggregate('Total', props.sas.map(x => x.area))

  //Create psuedo sa for total row
  let sas = _.concat([], [{area: totalArea}], props.sas)

  return (
    <div className="table sa-table">
      <div className="name">Name</div>
      <div>Population</div>
      <div>Positives</div>
      <div>Positives<br/> / 1m</div>
      <div>Deaths</div>
      <div>Deaths<br/> / 1m</div>

      {sas.map ((sa, i) => {
        let url = sa.code ? "/country/usa/csa/" + sa.code : null
        let a = sa.area
        let last = a.lastFrame
        let last1M = a.series.scale(1000000/a.population).last

        return <React.Fragment key={"sa-" + sa.title}>
          <div className="name">
            {url ? <Link to={url}>{a.name}</Link> : a.name}
          </div>
          <div className="population">{H.numberWithCommas(a.population)}</div>
          <div className="positives">{last && H.numberWithCommas(last.positives)}</div>
          <div className="positive/1m">{last1M && H.safeSmartNumPlaces(last1M.positives)}</div>
          <div className="deaths">{last && last.deaths}</div>
          <div className="deaths/1m">{last1M && H.safeSmartNumPlaces(last1M.deaths)}</div>
        </React.Fragment>
      })}
    </div>
  )
}

function StateTable(props) {
  let totalArea = M.AreaModel.createAggregate('Total', props.states)
  let areas = _.concat([], [totalArea], props.states)

  return (
    <div className="table state-table">
      <div className="name">Name</div>
      <div>Population</div>
      <div>Positives</div>
      <div>Positives<br/> / 1m</div>
      <div>Deaths</div>
      <div>Deaths<br/> / 1m</div>
      <div>Positive<br/> Rate <br/> all time</div>
      <div>Positive<br/> Rate <br/> last 7d</div>
      <div>Positive<br/> Rate <br/> ∂</div>

      {areas.map ((a, i) => {
        let url = a.abbreviation ? "/states/" + a.abbreviation : null
        let last = a.transform().last
        let last1M = a.transform().scale(1000000/a.population).last
        let lastL7d = a.series.deltize(7).last

        return <React.Fragment key={"state-" + a.name}>
          <div className="name">
            {url ? <Link to={url}>{a.name}</Link> : a.name}
          </div>
          <div className="population">{H.numberWithCommas(a.population)}</div>
          <div className="positives">{last && H.numberWithCommas(last.positives)}</div>
          <div className="positive-per-1m">
            {last1M && H.safeSmartNumPlaces(last1M.positives)}
          </div>
          <div className="deaths">{last && last.deaths}</div>
          <div className="deaths-per-1m">{last1M && H.safeSmartNumPlaces(last1M.deaths)}</div>
          <div className="positive-rate">{last && H.percentDisplay(100*last.positiveRate, 2)}%</div>
          <div className="positive-rate-trailing">{lastL7d && H.percentDisplay(100*lastL7d.positiveRate, 2)}%</div>
          <div>{H.percentDisplay(100*(lastL7d.positiveRate-last.positiveRate), 2)}%</div>
        </React.Fragment>
      })}
    </div>
  )
}


function mapStateToProps(state, ownProps) {  
  return {
    //retrigger when counties are loaded.
    counties: state.counties
  }
}

export default connect(mapStateToProps)(TablesPage)