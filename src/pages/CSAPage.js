import React from 'react';
import {connect} from "react-redux"
import * as OMB from '../stores/OMBStore.js'
import M from '../models.js'
import C from '../components.js'

function CSAPage(props) {
  if(props.counties.length === 0 || props.csa === null) { return null }

  let csaCounties = props.counties.filter(x => props.csa.countiesFIPS.includes(x.fips))
  let area = M.AreaModel.createAggregate(`${props.csa.type}: ${props.csa.shortName}`, csaCounties)

  return <C.SAIso counties={csaCounties} area={area}/>
}

function mapStateToProps(state, ownProps) {
  let id = ownProps.match.params.id
  return {
    counties: state.counties,
    csa: OMB.CSAForCode(id)
  }
}

export default connect(mapStateToProps)(CSAPage)