import M from '../models.js'
import allSAs from '../stores/sas.json'

let allModels = []

export default class SAModel {
  static findCBSAByCode(code) {
    return SAModel.all.find(x => x.code === code && x.type === 'CBSA')
  }

  static findCSAByCode(code) {
    return SAModel.all.find(x => x.code === code && x.type === 'CSA')
  }

  static findByCodeAndType(code, type) {
    return SAModel.all.find(x => x.code === code && x.type === type)
  }

  static get all() {
    return allModels
  }

  constructor(props) {
    this.code = props.code
    this.type = props.type
    this.title = props.title
    if(this.type === "CBSA") {
      this.cbsaType = props.cbsaType
    }

    if(this.type === "CSA") {
      this.cbsaCodes = props.cbsaCodes
    }

    this.__counties = props.counties //each with fips, name, state

    allModels.push(this)
  }

  get counties() {
    let countiesFIPS = this.__counties.map(x => x.fips)
    return M.CountyModel.all.filter(x => countiesFIPS.includes(x.fips))
  }

  get shortTitle() {
    return this.title.split(',')[0]
  }

  createAreaAggregate() {
    return M.AreaModel.createAggregate(this.shortTitle, this.counties)
  }

}

allSAs.map(x => new SAModel(x))
//TODO: perhaps disable new SAModel construction?