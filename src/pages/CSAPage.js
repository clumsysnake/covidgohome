import React from 'react';
import {connect} from "react-redux"
import M from '../models.js'
import C from '../components.js'

function CSAPage(props) {
  if(props.counties.length === 0 || props.model === null) { return null }

  let area = props.model.createAreaAggregate()

  return <C.SAIso counties={props.counties} area={area}/>
}

function mapStateToProps(state, ownProps) {
  let code = ownProps.match.params.code
  let model = M.SAModel.findByCodeAndType(code, 'CSA')
  
  return {
    model,
    //required or when CountyModel loads rerender wont trigger
    counties: model && model.counties 
  }
}

export default connect(mapStateToProps)(CSAPage)