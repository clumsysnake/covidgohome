import React, { useState } from 'react';
import ReactTooltip from 'react-tooltip'
import USAMap from '../components/USAMap.js'
import Filter from '../components/Filter.js'

export default function MapPage(props) {
  let [mapField, setMapfield] = useState('death')
  let [basis, setBasis] = useState('per-1m')
  let [granularity, setGranularity] = useState('county')
  let [colorScale, setColorScale] = useState('log2')
  let [tooltip, setTooltip] = useState('')

  return <>
    <div className="top">
      <div className="filters">
        <Filter accessors={[mapField, setMapfield]} label="showing" options={[
          ['positive', 'positives'],
          ['total', '# tests'], 
          'hospitalized',
          ['death', 'deaths']
        ]}/>
        <Filter accessors={[basis, setBasis]} label="basis" options={[
          ['absolute', 'abs'],
          ['per-1m', 'abs/1m'],
          ['squared-per-1m', 'abs²/1m']
        ]} />
        <Filter accessors={[granularity, setGranularity]} options={[
          'state',
          'county'
        ]} />
        <Filter accessors={[colorScale, setColorScale]} label="scale" options={[
          'linear',
          'sqrt',
          ['log2', 'log(2)']
        ]} />
      </div>
    </div>
    <div className="bottom usa-map">
      <USAMap
        field={mapField}
        basis={basis}
        granularity={granularity}
        colorScale={colorScale}
        setTooltipContent={(c) => setTooltip(c)}
      />
      <ReactTooltip>{tooltip}</ReactTooltip>
    </div>
  </>
}

