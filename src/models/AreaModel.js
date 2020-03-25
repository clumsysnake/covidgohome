import _ from 'lodash'

let allModels = []

let decorateTimeSeries = (entries) => {
  entries.forEach((e, idx, a) => {
    e.posNeg = e.positive + e.negative //where total is neg + pos + pending
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

    return new AreaModel({name, entries})
  }

  //TODO: rename entries to series
  constructor(props) {
    this.entries = decorateTimeSeries(props.entries)
    this.name = props.name

    allModels.push(this)
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