import StateModel from './StateModel'

const REGION_MAP = {
  "tristate": ["NY", "CT", "NJ"],
  "northwest": ["OR", "WA"],
  "southern band": ["TX", "LA", "MS", "AL", "FL"],
  "carribbean": ["PR", "VI"]
}

let allModels = []

class RegionModel {
  static get RegionMap() {
    return REGION_MAP
  }

  static get all() {
    return allModels
  }

  constructor(name, stateCodes) {
    this.name = name
    this.stateCodes = stateCodes

    allModels.push(this)
  }

  get states() {
    return this._states = this._states || StateModel.all.filter(state => {
      return this.stateCodes.includes(state.code)
    }) || null
  }
}

export default RegionModel