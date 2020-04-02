import RegionModel from './RegionModel'
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

  static get withoutRegion() {
    return allModels.filter(m => m.region === null)
  }

  get code() {
    return this.abbrev
  }

  get censusData() {
    return censusDataForState(this.name)
  }

  //TODO: memoize?
  get counties() {
    return CountyModel.all.filter(c => c.stateName === this.name) || []
  }

  get region() {
    return this._region = this._region || RegionModel.all.find(r => {
      return r.stateNames.includes(this.name)
    }) || null
  }
}

export default StateModel