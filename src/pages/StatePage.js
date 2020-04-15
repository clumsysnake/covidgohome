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
    <div className="state-page">
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
              granularity="county"
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
          <ul>
            <li>
              <span className="label">Population</span>
              <span className="value">{H.numberWithCommas(state.population)}</span>
            </li>
            <li>
              <span className="label">Tests Performed</span>
              <span className="value">{H.numberWithCommas(current.results)} or {H.percentWithPlaces(currentPer1M.results/10000, 2)}</span>
            </li>
            <li>
              <span className="label">Tests Positive</span>
              <span className="value">{H.numberWithCommas(current.positives)} or {H.percentWithPlaces(100*current.positiveRate, 2)}</span>
            </li>
            <li>
              <span className="label">Attack Rate</span>
              <span className="value">{H.percentWithPlaces(100*state.attackRate, 3)}</span>
            </li>
            <li>
              <span className="label">CFR</span>
              <span className="value">{H.percentWithPlaces(100* current.deathRate, 2)} (estimated)</span>
            </li>
            <li>
              <span className="label">Dead</span>
              <span className="value">{H.numberWithCommas(current.deaths)} or {H.withPlaces(currentPer1M.deaths, 2)}/million</span>
            </li>
            <li>
              <span className="label">Hospitalizations</span>
              <span className="value">{H.percentWithPlaces(100 * current.admissionRate, 2) || "unknown"} admission rate</span>
            </li>
            <li>  
              <span className="label"></span>
              <span className="value">{H.numberWithCommas(current.admissions) || "unknown"} cumulative</span>
            </li>
            <li>
              <span className="label"></span>
              <span className="value">{H.numberWithCommas(current.inHospital) || "unknown"} currently</span>
            </li>
            <li>
              <span className="label"></span>
              <span className="value">{H.numberWithCommas(current.recovered) || "unknown"} recovered</span>
            </li>
            <li>
              <span className="label">In ICU</span>
              <span className="value">{H.numberWithCommas(current.inICU) || "unknown"} currently</span>
            </li>
            <li>
              <span className="label"></span>
              <span className="value">{H.numberWithCommas(current.intensifications) || "unknown"} cumulatively</span>
            </li>
            <li>
              <span className="label">Ventilated</span>
              <span className="value">{H.numberWithCommas(current.onVentilator) || "unknown"} currently</span>
            </li>
            <li>
              <span className="label"></span>
              <span className="value">{H.numberWithCommas(current.ventilations) || "unknown"} cumulative</span>
            </li>
          </ul>
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