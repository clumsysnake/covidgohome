import React, { useState } from 'react';
import ReactTooltip from 'react-tooltip'
import USAMap from '../components/USAMap.js'
import Filter from '../components/Filter.js'

export default function MapPage(props) {
  let [mapField, setMapfield] = useState('positives')
  let [basis, setBasis] = useState('total')
  let [granularity, setGranularity] = useState('county')
  let [colorScale, setColorScale] = useState('log2')
  let [tooltip, setTooltip] = useState('')

  return <>
    <div className="top">
      <div className="filters">
        <Filter accessors={[mapField, setMapfield]} label="showing" options={[
          ['positives', 'positives'],
          ['deaths', 'deaths'],
          ['results', '# tests']
        ]}/>
        <Filter accessors={[basis, setBasis]} label="basis" options={[
          'total',
          ['per-1m', 'total / capita'],
          // ['squared-per-1m', 'total² / capita']
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
        setTooltipContent={setTooltip}
      />
      <ReactTooltip place="right">{tooltip}</ReactTooltip>
    </div>
  </>
}

