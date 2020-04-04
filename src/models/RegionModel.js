import StateModel from './StateModel'
import AreaModel from './AreaModel'

const REGION_MAP = {
  "Tristate": ["New York", "Connecticut", "New Jersey"],
  "Northwest": ["Oregon", "Washington"],
  "Wet South": ["Texas", "South Carolina", "Georgia", "Florida", "Alabama", "Lousiana", "Mississippi"],
  "Southwest": ["Arizona", "New Mexico"],
  // "Carribbean": ["Puerto Rico", "Virgin Islands"]
}

let allModels = []

class RegionModel {
  static get RegionMap() {
    return REGION_MAP
  }

  static get all() {
    if(allModels.length === 0) { 
      allModels = Object.entries(RegionModel.RegionMap).map(pair => {
        return new RegionModel(pair[0], pair[1])
      })
    }

    return allModels
  }

  constructor(name, stateNames) {
    this.name = name
    this.stateNames = stateNames

    allModels.push(this)
  }

  //TODO: Not memoized because clearing cache when states update is too much complexity
  get states() {
    return StateModel.all.filter(state => {
      return this.stateNames.includes(state.name)
    }) || []
  }

  //TODO: memoize aggregate?
  createAggregate () {
    return AreaModel.createAggregate(this.name, this.states)
  }
}

export default RegionModel