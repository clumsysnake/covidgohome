import _ from 'lodash'
import moment from 'moment'

let allModels = []

let decorateTimeSeries = (entries) => {
  entries.forEach((e, idx, a) => {
    //regularize broken data
    if(e.negative === null && idx > 0) { e.negative = a[idx-1].negative }


    e.positiveDelta = e.positiveIncrease || 0
    e.negativeDelta = e.negativeIncrease || 0
    e.deathDelta = e.deathIncrease || 0
    e.hospitalizedDelta = e.hospitalizedIncrease || 0
    e.posNegDelta = e.totalTestResultsIncrease || 0

    //CRZ: Not sure if these are meaningful. total is total # of tests done, totalTestResults is number 
    // that have come back. total only doesn't differ from totalTestResults when there are pending tests
    // however some states dont report pendings.
    e.pendingDelta = (idx > 0) ? (e.pending || 0) - (a[idx-1].pending || 0) : null 
    e.totalDelta = (idx > 0) ? (e.total || 0) - (a[idx-1].total || 0) : null 
    e.positivePercent = 100 * (e.positive || 0) / e.totalTestResults
    e.positivePercentDelta = (idx > 0) ? (e.positiveDelta / e.posNegDelta) * 100 : null
  })

  return entries
}

//CRZ: As an aside, from only positive, negative, hospitalized, death, and pending you can calculate the rest.
const primaryStats = ['positive', 'negative', 'hospitalized', 'death', 'totalTestResults', 'pending']
const increasingStats = ['positive', 'negative', 'hospitalized', 'death', 'totalTestResults', 'total']
const deltaStats = ['positiveIncrease', 'negativeIncrease', 'hospitalizedIncrease', 'deathIncrease', 'totalTestResultsIncrease']
const allStats = _.concat(increasingStats, deltaStats, ['pending'])
const emptyEntry = allStats.reduce((h, key) => { h[key] = 0; return h}, {})

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

  static createAggregate(name, areas) {
    //CRZ: not elegant but js doesnt like func prog.
    let entries = []
    areas.flatMap(a => a.entries).forEach((e) => {
      let s = entries.find(s => s.date === e.date) 
      if(_.isNil(s)) {
        s = {date: e.date}
        Object.assign(s, emptyEntry)
        entries.push(s)
      }

      Object.keys(emptyEntry).forEach((key) => {
        s[key] += e[key] || 0
      })
    })
    entries.sort((a,b) => (a.date > b.date) ? 1 : -1 )

    let population = areas.reduce((sum, a) => sum + a.population, 0)

    return new AreaModel({name, entries, population})
  }

  //TODO: rename entries to series
  constructor(props) {
    if(!_.isArray(props.entries)) { throw new TypeError("entries must be an array") }

    this.entries = decorateTimeSeries(props.entries)
    this.name = props.name
    this.population = props.population

    //memoize
    this.__scaledSeries = []
    this.__scaledToPercentage = null
    this.__scaledSquaredPerMillion = null

    allModels.push(this)
  }

  scaledSeries(scale) {
    if(scale === 1) {
      return this.entries
    }

    let existing = this.__scaledSeries.find(ss => ss.scale === scale)

    if(existing) { 
      return existing.series
    }

    let decoratedScaled = decorateTimeSeries(this.entries.map(e => {
      return allStats.reduce((h, f) => {
        h[f] = e[f]/scale; return h
      }, { date: e.date}  )
    }))
    this.__scaledSeries.push({scale: scale, series: decoratedScaled})

    return decoratedScaled
  }

  scaledSeriesPerCapita(capitaSize) {
    return this.scaledSeries(this.population / capitaSize)
  }

  scaledPerMillion() {
    return this.scaledSeriesPerCapita(1000000.0)
  }

  scaledSquaredPerMillion() {
    if(this.__scaledSquaredPerMillion) { return this.__scaledToPercentage }

    let scale = this.population / 1000000.0

    let decoratedScaled = decorateTimeSeries(this.entries.map(e => {
      return allStats.reduce((h, f) => {
        h[f] = e[f] * e[f]/scale; return h
      }, { date: e.date}  )
    }))

    return decoratedScaled
  }

  inBasis(basis) {
    switch(basis) {
      case 'total': return this.entries
      case 'per-1m': return this.scaledPerMillion()
      case 'squared-per-1m': return this.scaledSquaredPerMillion()
      default:
        throw new TypeError(`inBasis encountered unknown basis ${basis}`)
    }
  }

  //CRZ: Unlike other scaling functions, each entry is scaled differently here.
  scaledToPercentage() {
    if(this.__scaledToPercentage) { return this.__scaledToPercentage }

    return this.__scaledToPercentage = decorateTimeSeries(this.entries).map(e => {
      const scale = (e.positive + e.negative + e.pending)/100
      const deltaScale = e.total/100

      return {
        date: e.date,
        positive: e.positive/scale,
        negative: e.negative/scale,
        pending: e.pending/scale,
        death: e.death/scale,
        hospitalized: e.hospitalized/scale,
        total: e.total/scale,
        posNeg: e.posNeg/scale,
        posNegDelta: e.posNegDelta/deltaScale ,
        positiveDelta: e.positiveDelta/deltaScale,
        negativeDelta: e.negativeDelta/deltaScale,
        pendingDelta: e.pendingDelta/deltaScale,
        deathDelta: e.deathDelta/deltaScale,
      }
    })
  }

  get totals() {
    let last = _.last(this.entries) || null
    let positive = (last && last.positive) || null
    let total = (last && last.total) || null
    let totalTestResults = (last && last.totalTestResults) || null
    let death = (last && last.death) || null
    let hospitalized = (last && last.hospitalized) || null

    return this._stats = this._stats || {
      total,
      totalTestResults,
      positive,
      death,
      hospitalized,
      positivePercent: 100 * (positive / totalTestResults) || null,
      cfrPercent: 100 * death/positive,
      hospitalizationRate: 100 * hospitalized/positive,
      attackRate: this.population ? 100 * positive/this.population : null
    }
  }

  //CRZ: only bother matching the primary fields
  findMatchingEntry(hash) {
    return this.entries.find((e) => AreaModel.primaryStats.every(field => e[field] === hash[field]))
  }

  //CRZ: just tacks fields onto the end, incrementing date.
  //     TODO: this is really very tied to the bizarre needs of ctActions.js, very spaghetti.
  addEntryFromPrimaries(hash) {
    let last = _.last(this.entries)
    let date = moment.unix(last.date).add('days', 1).unix()
    let abbreviation = this.abbreviation

    let entry = AreaModel.primaryStats.reduce((h, k) => Object.assign(h, {[k]: hash[k]}), {date})

    // debugger
    entry.state = abbreviation
    entry.positiveIncrease = entry.positive - last.positive
    entry.negativeIncrease = entry.negative - last.negative
    entry.deathIncrease  = entry.death - last.death
    entry.hospitalizedIncrease = entry.hospitalized - last.hospitalized
    entry.totalTestResultsIncrease = entry.totalTestResults - last.totalTestResults

    this.entries.push(entry)
  }
}

AreaModel.primaryStats = primaryStats

export default AreaModel