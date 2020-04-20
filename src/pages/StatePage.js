import React, {useState} from 'react'
import ReactTooltip from 'react-tooltip'
import { connect } from 'react-redux'
import Select from 'react-select'
import { useHistory } from "react-router-dom"

import C from '../components.js'
import M from '../models.js'

import './StatePage.css'
import * as H from '../helpers/chartHelpers.js'

function StatePage(props) {
  const history = useHistory();
  const [tooltip, setTooltip] = useState('')
  const [mapField, setMapfield] = useState('positives')
  const [basis, setBasis] = useState('per-1m')
  const [colorScale, setColorScale] = useState('linear')
  const [mapDate, setMapDate] = useState(null)
  
  if(!props.state) { return <div>...loading</div> }

  let state = props.state
  let current = state.series.last
  let currentPer1M = state.series.scale(1000000/state.population).last

  let startDate = M.AreaModel.fieldMin(state.counties, 'date')
  let endDate = M.AreaModel.fieldMax(state.counties, 'date')

  return (
    <div className="state-page iso-page">
      <div className="top">
        <div className="left">
          <div className="filters">
            <C.Filter accessors={[mapField, setMapfield]} options={[
              ['positives', 'positives'],
              ['deaths', 'deaths']
            ]}/>
            <C.Filter accessors={[basis, setBasis]} options={[
              'total',
              ['per-1m', 'total/capita'],
              // ['squared-per-1m', 'total² / capita']
            ]}/>
            <C.Filter accessors={[colorScale, setColorScale]} options={[
              'linear',
              'sqrt',
              ['log2', 'log(2)']
            ]}/>
          </div>
          <div className="state-map">
            <C.StateMap
              state={state}
              field={mapField}
              basis={basis}
              colorScale={colorScale}
              setTooltipContent={setTooltip}
              date={mapDate || endDate}
            />
            <ReactTooltip place="right">{tooltip}</ReactTooltip>
          </div>
          <C.DateSlider startDate={startDate} endDate={endDate} onChange={setMapDate} />
        </div>
        <div className="stats">
          <Select className="select-dropdown"
                  onChange={option => history.push("/states/" + option.value)}
                  options={props.stateOptions}
                  placeholder={state.name}/>
          <C.Stats>
            <C.Stat label="Population" value={H.numberWithCommas(state.population)} />
            <C.Stat label="Tests Performed">
              {H.numberWithCommas(current.results)} or {H.percentWithPlaces(currentPer1M.results/10000, 2)}
            </C.Stat>
            <C.Stat label="Tests Positive">
              {H.numberWithCommas(current.positives)} or {H.percentWithPlaces(100*current.positiveRate, 2)}
            </C.Stat>
            <C.Stat label="Attack Rate" value={H.percentWithPlaces(100*state.attackRate, 3)} />
            <C.Stat label="CFR">
              {H.percentWithPlaces(100* current.deathRate, 2)} (estimated)
            </C.Stat>
            <C.Stat label="Dead">
              {H.numberWithCommas(current.deaths)} or {H.withPlaces(currentPer1M.deaths, 2)}/million
            </C.Stat>
            <C.Stat label="Hospitalizations">
              {H.percentWithPlaces(100 * current.admissionRate, 2) || "unknown"} admission rate
            </C.Stat>
            <C.Stat>{H.numberWithCommas(current.admissions) || "unknown"} cumulative
            </C.Stat>
            <C.Stat>{H.numberWithCommas(current.inHospital) || "unknown"} currently</C.Stat>
            <C.Stat>{H.numberWithCommas(current.recovered) || "unknown"} recovered</C.Stat>
            <C.Stat label="In ICU">
              {H.numberWithCommas(current.inICU) || "unknown"} currently
            </C.Stat>
            <C.Stat>{H.numberWithCommas(current.intensifications) || "unknown"} cumulatively</C.Stat>
            <C.Stat label="Ventilated">
              {H.numberWithCommas(current.onVentilator) || "unknown"} currently
            </C.Stat>
            <C.Stat>{H.numberWithCommas(current.ventilations) || "unknown"} cumulative</C.Stat>
          </C.Stats>
        </div>
      </div>
      <hr />
      <C.AreaIsoCharts area={state}/>
    </div>
  )
}

function mapStateToProps(state, ownProps) {
  let abbrev = ownProps.match.params.stateAbbrev
  return {
    state: state.states.find(s => s.abbreviation.toUpperCase() === abbrev),
    stateOptions: state.states.map(s => { return {label: s.name, value: s.abbreviation }})
  }
}

export default connect(mapStateToProps)(StatePage)