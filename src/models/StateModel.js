import RegionModel from './RegionModel'
import AreaModel from './AreaModel'

let allModels = []

class StateModel extends AreaModel {
  constructor(props) {
    super(props)

    allModels.push(this)
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