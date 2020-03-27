import RegionModel from './RegionModel'
import AreaModel from './AreaModel'
import { stateNameForAbbrev } from '../stores/CensusStore'

let allModels = []

class StateModel extends AreaModel {
  constructor(props) {
    super(props)

    this.abbreviation = props.name
    this.name = stateNameForAbbrev(this.abbreviation)

    //TODO: prevent two states with same name or abbreviation
    allModels.push(this)
  }

  static findByAbbreviation(abbrev) {
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
    return this.name
  }

  get region() {
    return this._region = this._region || RegionModel.all.find(r => {
      return r.stateCodes.includes(this.code)
    }) || null
  }
}

export default StateModel