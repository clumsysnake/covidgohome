import StateModel from './StateModel'
import AreaModel from './AreaModel'

const REGION_MAP = {
  "Tristate": ["NY", "CT", "NJ"],
  "Northwest": ["OR", "WA"],
  "Wet South": ["SC", "GA", "FL", "AL", "LA", "MS"],
  "Dry South": ["TX", "AZ", "NM"],
  "Carribbean": ["PR", "VI"]
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

  //TODO: Not memoized because clearing cache when states update is too much complexity
  get states() {
    return StateModel.all.filter(state => {
      return this.stateCodes.includes(state.code)
    }) || []
  }

  createAggregate () {
    return AreaModel.createAggregate(this.name, this.states)
  }
}

export default RegionModel