import React from 'react';
import {connect} from "react-redux"
import * as OMB from '../stores/OMBStore.js'
import M from '../models.js'
import C from '../components.js'

function CBSAPage(props) {
  if(props.counties.length === 0 || props.cbsa === null) { return null }

  let cbsaCounties = props.counties.filter(x => props.cbsa.countiesFIPS.includes(x.fips))
  let area = M.AreaModel.createAggregate(props.cbsa.shortName, cbsaCounties)

  return <C.SAIso counties={cbsaCounties} area={area}/>
}

function mapStateToProps(state, ownProps) {
  let id = ownProps.match.params.id
  return {
    counties: state.counties,
    cbsa: OMB.CBSAForCode(id)
  }
}

export default connect(mapStateToProps)(CBSAPage)