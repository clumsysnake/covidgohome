import _ from '../lodash.js'
import Series from './Series.js'

let allModels = []

class AreaModel {
  static get all() {
    return allModels
  }

  static sortFunction(type) {
    switch(type) {
      case "alpha":
        return (a, b) => (a.name < b.name) ? -1 : 1
      case "most-positives":
      case "most-cases":
        return (a, b) => {
          let aVal = (a.series.last && a.series.last.positives)
          let bVal = (b.series.last && b.series.last.positives)
          if(!_.isFinite(aVal)) { return 1 }
          if(!_.isFinite(bVal)) { return -1 }
          return (aVal > bVal) ? -1 : 1
        }
      case "most-tests":
        return (a, b) => {
          let aVal = (a.series.last && a.series.last.results)
          let bVal = (b.series.last && b.series.last.results)
          if(!_.isFinite(aVal)) { return 1 }
          if(!_.isFinite(bVal)) { return -1 }
          return (aVal > bVal) ? -1 : 1
        }
      default:
        throw new TypeError(`unknown sort function type ${type}`)
    }
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

  //TODO: need to doublecheck this Math.min way of comparing..
  //TODO: proper return value if some areas have no frames at all?
  //TODO: proper return value if all areas have frames but no common frame?
  static findMostRecentCommonFrameDate(areas) {
    return areas.reduce(
      (mrcd, a) => Math.min(mrcd, a.lastFrame.date),
      areas[0] && areas[0].lastFrame && areas[0].lastFrame.date
    )
  }

  //TODO: there is a bug here... if only SOME areas have values for some dates,
  //      the resulting series looks like it trails off at those dates
  //TODO: Series should handle its own merging... delegate that.
  //TODO: define strategies for aggregation; atm just trims any incomplete areas.
  static createAggregate(name, areas, strategy = "trim") {
    let children = areas

    if(strategy === "trim") {
      children = children.filter(c => _.isFinite(c.population))
    }

    let lastDate = AreaModel.findMostRecentCommonFrameDate(children)

    let frames = children.flatMap(a => a.series.frames).reduce((frames, frame) => {
      if(frame.date > lastDate) { return frames }

      let s = frames.find(s => s.date === frame.date)

      if(_.isNil(s)) {
        return frames.concat(_.pick(frame, Series.FUNDAMENTAL))
      } else {
        //TODO: fugly
        Series.FUNDAMENTAL_METRICS.forEach((key) => {
          if(frame.hasOwnProperty(key)) {
            s[key] += frame[key]
          }
        })
        return frames
      }
    }, [])
    frames.sort((a,b) => (a.date > b.date) ? 1 : -1 )

    let population = children.reduce((sum, a) => sum + a.population, 0)

    return new AreaModel({name, frames, population, children})
  }

  constructor(props) {
    if(!_.isArray(props.frames)) { throw new TypeError("frames must be an array") }

    this.series = new Series(props.frames)
    this.name = props.name
    this.population = props.population
    this.density = props.density
    this.children = props.children

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

  //CRZ: convenience forwarding functions to series
  transform() { return this.series.transform() }
  get lastFrame() { return this.series.last }
  get frames() { return this.series.frames }
  frameForDate(date) { return this.series.frameForDate(date) }

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
}

export default AreaModel