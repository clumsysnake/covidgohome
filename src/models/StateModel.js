import RegionModel from './RegionModel'

let allModels = []

class StateModel {
  static get all() {
    return allModels
  }

  constructor(props) {
    for(let [k, v] of Object.entries(props)) {
      this[k] = v
    }

    allModels.push(this)
  }

  get region() {
    return this._region = this._region || RegionModel.all.find(r => {
      return r.stateCodes.includes(this.code)
    }) || null
  }
}

export default StateModel