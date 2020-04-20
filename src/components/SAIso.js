import React, { useState } from 'react';
import ReactTooltip from 'react-tooltip'
import M from '../models.js'
import C from '../components.js'
import * as H from '../helpers/chartHelpers.js'

function SAIso(props) {
  const [tooltip, setTooltip] = useState('')
  const [mapField, setMapfield] = useState('positives')
  const [basis, setBasis] = useState('per-1m')
  const [colorScale, setColorScale] = useState('linear')
  const [mapDate, setMapDate] = useState(props.area && props.area.lastFrame.date)

  let area = props.area
  if(area === null) { return null } 

  let current = props.area.series.last
  let currentPer1M = area.series.scale(1000000/area.population).last
  let startDate = M.AreaModel.fieldMin(props.counties, 'date')
  let endDate = M.AreaModel.fieldMax(props.counties, 'date')

  return <div className="iso-page">
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
          <C.SAMap
            counties={props.counties}
            field={mapField}
            basis={basis}
            colorScale={colorScale}
            setTooltipContent={setTooltip}
            date={mapDate}
          />
          <ReactTooltip place="right">{tooltip}</ReactTooltip>
        </div>
        <C.DateSlider startDate={startDate} endDate={endDate} onChange={setMapDate} />
      </div>
      <div class="right">
        <span className="sa-name">{props.area.name}</span>
        <div className="stats">
          <C.Stats>
            <C.Stat label="Population">{H.numberWithCommas(area.population)}</C.Stat>
            <C.Stat label="Tests Positive">{H.numberWithCommas(current.positives)}</C.Stat>
            <C.Stat label="Attack Rate">{H.percentWithPlaces(100*area.attackRate, 3)}</C.Stat>
            <C.Stat label="CFR">{H.percentWithPlaces(100* current.deathRate, 2)} (estimated)</C.Stat>
            <C.Stat label="Dead">
              {H.numberWithCommas(current.deaths)} or {H.withPlaces(currentPer1M.deaths, 2)}/million
            </C.Stat>
            <C.Stat label="Recovered">{H.numberWithCommas(current.recovered) || "unknown"}</C.Stat>
          </C.Stats>
        </div>
      </div>
    </div>
    <C.AreaIsoCharts area={props.area} />
  </div>
}

export default SAIso