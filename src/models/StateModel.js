import CountyModel from './CountyModel'
import AreaModel from './AreaModel'
import { stateNameForAbbrev, censusDataForState } from '../stores/CensusStore'

let allModels = []

class StateModel extends AreaModel {
  constructor(props) {
    super(props)

    this.abbreviation = props.name
    this.fullname = stateNameForAbbrev(this.abbreviation)

    //TODO: validate input better.. whats acceptable starting props?
    if(props.abbrev) {
      this.abbreviation = props.abbrev
      this.name = stateNameForAbbrev(this.abbreviation)
    }

    //TODO: prevent two states with same name or abbrev
    allModels.push(this)
  }

  static findByAbbrev(abbrev) {
    return StateModel.all.find(s => s.abbreviation === abbrev)
  }

  static findByName(name) {
    return StateModel.all.find(s => s.name === name)
  }

  static get all() {
    return allModels
  }

  get code() {
    return this.abbrev
  }

  get censusData() {
    console.log('warning: censusData shouldnt be called')
    return censusDataForState(this.name)
  }

  //TODO: memoize?
  get counties() {
    return CountyModel.all.filter(c => c.stateName === this.name) || []
  }
}

export default StateModel