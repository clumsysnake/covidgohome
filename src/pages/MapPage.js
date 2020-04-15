import React, { useState } from 'react';
import ReactTooltip from 'react-tooltip'
import M from '../models.js'
import C from '../components.js'

export default function MapPage(props) {
  let [mapField, setMapfield] = useState('positives')
  let [basis, setBasis] = useState('total')
  let [granularity, setGranularity] = useState('county')
  let [colorScale, setColorScale] = useState('log2')
  let [tooltip, setTooltip] = useState('')
  let [mapDate, setMapDate] = useState(null)

  return <>
    <div className="top">
      <div className="filters">
        <C.Filter accessors={[mapField, setMapfield]} label="showing" options={[
          ['positives', 'positives'],
          ['deaths', 'deaths'],
          ['results', '# tests']
        ]}/>
        <C.Filter accessors={[basis, setBasis]} label="basis" options={[
          'total',
          ['per-1m', 'total / capita'],
          // ['squared-per-1m', 'total² / capita']
        ]} />
        <C.Filter accessors={[granularity, setGranularity]} options={[
          'state',
          'county'
        ]} />
        <C.Filter accessors={[colorScale, setColorScale]} label="scale" options={[
          'linear',
          'sqrt',
          ['log2', 'log(2)']
        ]} />
      </div>
      {/*<C.DateSlider startDate={startDate} endDate={endDate} onChange={setMapDate} />*/}
    </div>
    
    <div className="bottom usa-map">
      <C.USAMap
        field={mapField}
        basis={basis}
        granularity={granularity}
        colorScale={colorScale}
        setTooltipContent={setTooltip}
      />
      <ReactTooltip place="right">{tooltip}</ReactTooltip>
    </div>
  </>
}

