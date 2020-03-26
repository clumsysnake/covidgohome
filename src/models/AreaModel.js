import _ from 'lodash'

let allModels = []

let decorateTimeSeries = (entries) => {
  entries.forEach((e, idx, a) => {
    e.posNeg = e.positive + e.negative //where total is neg + pos + pending
    e.posPerc = 100 * e.positive / e.posNeg
    e.positiveDelta = (idx > 0) ? e.positive - a[idx-1].positive : null
    e.negativeDelta = (idx > 0) ? e.negative - a[idx-1].negative : null
    e.pendingDelta = (idx > 0) ? e.pending - a[idx-1].pending : null
    e.deathDelta = (idx > 0) ? e.death - a[idx-1].death : null
    e.hospitalizedDelta = (idx > 0) ? e.hospitalized - a[idx-1].hospitalized : null
    e.posNegDelta = (idx > 0) ? e.posNeg - a[idx-1].posNeg : null
    e.posPercToday = (idx > 0) ? (e.positiveDelta / e.posNegDelta) * 100 : null

    //regularize broken data
    if(e.negative === null && idx > 0) { e.negative = a[idx-1].negative }
  })

  return entries
}

class AreaModel {
  static get all() {
    return allModels
  }

  static fieldMax(areas, field, perMillion=false) {
    return AreaModel.fieldExtremum(areas, field, 'max', perMillion)
  }

  static fieldMin(areas, field, perMillion=false) {
    return AreaModel.fieldExtremum(areas, field, 'min', perMillion)
  }

  static fieldExtremum(areas, field, funcName, perMillion=false) {
    let entries = areas.flatMap(a => (perMillion) ? a.scaledPerMillion() : a.entries)
    return entries.reduce((agg, e) => Math[funcName](agg, e[field]), entries[0] && entries[0][field])
  }

  static createAggregate(name, areas) {
    const emptyEntry = {
      positive: 0,
      negative: 0,
      pending: 0, 
      hospitalized: 0,
      death: 0,
      total: 0
      //TODO: dateChecked? how to use that. maybe AreaModel should include a range of dateChecked?
    }

    //CRZ: not elegant but js doesnt like func prog.
    let entries = []
    areas.flatMap(a => a.entries).forEach((e) => {
      let s = entries.find(s => s.date === e.date) 
      if(_.isNil(s)) {
        s = {}
        Object.assign(s, emptyEntry)
        s['date'] = e.date
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
    this.entries = decorateTimeSeries(props.entries)
    this.name = props.name
    this.population = props.population

    //memoize
    this.__scaledSeries = []

    allModels.push(this)
  }

  //TODO: if scale === 1, dont calculate just return entries
  scaledSeries(scale) {
    let existing = this.__scaledSeries.find(ss => ss.scale === scale)

    if(existing) { 
      return existing.series
    }

    let decoratedScaled = decorateTimeSeries(this.entries.map(e => {
      return {
        date: e.date,
        positive: e.positive/scale,
        negative: e.negative/scale,
        pending: e.pending/scale,
        death: e.death/scale,
        hospitalized: e.hospitalized/scale,
        total: e.total/scale
      }
    }))
    this.__scaledSeries.push({scale: scale, series: decoratedScaled})

    return decoratedScaled
  }

  scaledSeriesPerCapita(capitaSize) {
    //TODO: test/enforce float math
    return this.scaledSeries(this.population / capitaSize)
  }

  scaledPerMillion() {
    return this.scaledSeriesPerCapita(1000000.0)
  }

  get stats() {
    let last = _.last(this.entries) || null
    let totalConfirmed = (last && last.positive) || null
    let totalTests = (last && last.total) || null

    return this._stats = this._stats || {
      totalTests,
      totalConfirmed,
      perTotalConfirmed: 100 * (totalConfirmed / totalTests) || null,
      totalDead: (last && last.death) || null
    }
  }
}

export default AreaModel