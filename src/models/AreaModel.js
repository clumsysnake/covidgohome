import _ from 'lodash'
import Series from './Series.js'

let allModels = []

class AreaModel {
  static get all() {
    return allModels
  }

  //TODO: perMillion flags are weird. either perPopulation flag (capita = 1) or perCapita as integer
  static fieldMax(areas, field, basis = "total") {
    return AreaModel.fieldExtremum(areas, field, 'max', basis)
  }

  static fieldMin(areas, field, basis = "total") {
    return AreaModel.fieldExtremum(areas, field, 'min', basis)
  }

  static fieldExtremum(areas, field, funcName, basis = "total") {
    return areas.flatMap(a => a.inBasis(basis)).reduce((agg, e) => {
      if(!_.isFinite(agg)) {
        return e[field]
      } else if(!_.isFinite(e[field])) {
        return agg
      } else  {
        return Math[funcName](agg, e[field])
      }
    }, null)
  }

  // static createAggregate(name, areas) {
  //   //CRZ: not elegant but js doesnt like func prog.
  //   let entries = []
  //   areas.flatMap(a => a.entries).forEach((e) => {
  //     let s = entries.find(s => s.date === e.date) 
  //     if(_.isNil(s)) {
  //       s = {date: e.date}
  //       Object.assign(s, emptyEntry)
  //       entries.push(s)
  //     }

  //     Object.keys(emptyEntry).forEach((key) => {
  //       s[key] += e[key] || 0
  //     })
  //   })
  //   entries.sort((a,b) => (a.date > b.date) ? 1 : -1 )

  //   let population = areas.reduce((sum, a) => sum + a.population, 0)

  //   return new AreaModel({name, entries, population})
  // }

  //TODO: rename entries to series
  constructor(props) {
    if(!_.isArray(props.series)) { throw new TypeError("series must be an array") }

    this.series = new Series(props.series)
    this.name = props.name
    this.population = props.population
    this.density = props.density

    allModels.push(this)
  }

  perCapitaTransform(capitaSize = 1) {
    return this.series.scale(capitaSize / this.population)
  }

  perMillionTransform() {
    return this.perCapitaTransform(1000000.0)
  }

  squaredPerMillionTransform() {
  	// return this.perMillionTransform().square()
    return this.series.square()
  }

  get lastFrame() {
    return this.series.last
  }

  //CRZ: attack rate is simple, # of positives per person
  get attackRate() {
    return this.perCapitaTransform().last.positives
  }

  inBasis(basis) {
    switch(basis) {
      case 'total': return this.series.frames
      case 'per-1m': return this.perMillionTransform().frames
      case 'squared-per-1m': return this.squaredPerMillionTransform().frames
      default:
        throw new TypeError(`inBasis encountered unknown basis ${basis}`)
    }
  }

  //CRZ: only bother matching the primary fields
  findMatchingEntry(hash) {
    return this.entries.find((e) => AreaModel.areEqualFrames(hash, e))
  }
}

export default AreaModel