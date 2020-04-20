import AreaModel from './AreaModel'
import StateModel from './StateModel'

let allModels = []

class CountyModel extends AreaModel {
  constructor(props) {
    super(props)

    this.fips = props.fips
    this.stateName = props.stateName

    allModels.push(this)
  }

  static get all() {
    return allModels
  }

  static findByFips(fips) {
    var county = allModels.find(c => c.fips === fips)

    return county
  }

  get state() {
    return StateModel.all.find(s => s.name === this.stateName) || null
  }
}

export default CountyModel