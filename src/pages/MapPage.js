import PropTypes from 'prop-types'
import React, { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import {connect} from "react-redux"

import M from '../models.js'
import C from '../components.js'

function MapPage(props) {
  let [mapField, setMapfield] = useState('positives')
  let [basis, setBasis] = useState('total')
  let [granularity, setGranularity] = useState('county')
  let [colorScale, setColorScale] = useState('log2')
  let [tooltip, setTooltip] = useState('')
  // let [mapDate, setMapDate] = useState(null)

  let aggregatedUSA = M.AreaModel.createAggregate('USA', props.states)

  return <React.Fragment>
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

      <C.AreaIsoCharts area={aggregatedUSA}/>
  </React.Fragment>
}

const mapStateToProps = (state, ownProps) => ({
  states: state.states,
  counties: state.counties
})

MapPage.defaultProps = {
  states: PropTypes.array
}

export default connect(mapStateToProps)(MapPage)