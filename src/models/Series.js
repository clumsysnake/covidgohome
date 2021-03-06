//TODO: the only strange part about Series/Transform is how rates are handled. its almost
//      like they are a separate series that gets transformed differently...

import _ from '../lodash.js'

function finiteOrNull(v) {
  return (_.isFinite(v)) ? v : null
}

export default class Series {
  constructor(frames) {
    this.__frames = frames.map((f, fidx) => {
      Object.entries(f).forEach(([k,v]) => {
        if(!Series.ALL.includes(k)) { 
          throw new TypeError(`frame #${fidx+1} has unknown field '${k}' = '${v}'`)
        }

        if(Series.DERIVED.includes(k)) { 
          throw new TypeError(`frame #${fidx+1} has derived field '${k}' = '${v}'`)
        }

        if(Series.TOGGLES.includes(k)) {
          if(v < 0) {
            throw new TypeError(`Series constructor in frame #${fidx+1} passed value for toggle field below 0: ${k}: ${v}`)
          }
        }
      })

      //populate derived metrics
      //TODO: not sure the finiteOrNull works... every field has to be finite for these to work.
      return Object.assign({}, f, {
        results: finiteOrNull(f.positives + f.negatives),
        resolutions: finiteOrNull(f.deaths + f.recoveries),
        pending: finiteOrNull(f.collections - f.positives - f.negatives),
        active: finiteOrNull(f.positives - f.deaths - f.recoveries),
        mild: finiteOrNull(f.positives - f.deaths - f.recoveries - f.inHospital)
      })
    })
  }

  scale(...args) { return this.transform().scale(...args) }
  deltize(...args) { return this.transform().deltize(...args) }
  deltaPercentize(...args) { return this.transform().deltaPercentize(...args) }
  average(...args) { return this.transform().average(...args) }
  square(...args) { return this.transform().square(...args) }
  ratesScale(...args) { return this.transform().ratesScale(...args) }

  transform() {
    return new Transform(this)
  }

  get frames() {
    return this.__frames
  }

  //TODO: can optimize by only transforming the last frame
  get last() {
    return _.last(this.frames)
  }

  frameForDate(date) {
    return this.transform().frameForDate(date)
  }
}

//lazy
class Transform {
  constructor(series, operations = [], rateOperations = []) {
    this.__operations = operations
    this.__rateOperations = rateOperations
    this.series = series
  }

  get last() {
    return _.last(this.frames)
  }

  //CRZ: deltizing, which is almost a derivative, except discrete derivatives averages between 
  //     previous and next frame
  newT(operation = null, rateOperation = null) { 
    let t = new Transform(
      this.series, 
      this.__operations.concat(operation ? [operation] : []), 
      this.__rateOperations.concat(rateOperation ? [rateOperation] : [])
    )
    return t
  }
  deltize = (...args) => this.newT(['deltize', args])
  scale = (...args) => this.newT(['scale', args])
  deltaPercentize = (...args) => this.newT(['deltaPercentize', args])
  average = (...args) => this.newT(['average', args])
  square = (...args) => this.newT(['square', args])
  deltaPercentize = (...args) => this.newT(['deltaPercentize', args])
  ratesScale = (...args) => this.newT(null, ['ratesScale', args])

  __addOperation(name, args) {
    this.__operations.push([name, args])
  }

  get frames() {
    let transformedWithRates = this.__operations.reduce((data, operation) => {
      return this.__transform(data, operation)
    }, this.series.frames).map(f => {
      return Object.assign(f, {
        deathRate: finiteOrNull(f.deaths / f.positives),
        positiveRate: finiteOrNull(f.positives / f.results),
        admissionRate: finiteOrNull(f.admissions / f.positives),
        icuRate: finiteOrNull(f.intensifications / f.admissions)
      })
    })

    return this.__rateOperations.reduce((data, operation) => {
      return this.__transform(data, operation)
    }, transformedWithRates)
  }

  frameForDate(date) {
    return this.frames.find(f => f.date === date)
  }

  //TODO: make each transform separate functions
  __transform(data, operation) {
    let type = operation[0]
    let args = operation[1]

    switch(type) {
      case 'scale':
        let scaling = args[0]

        return data.map((f) => {
          return Series.METRICS.reduce((h, metric) => {
            if(h.hasOwnProperty(metric)) {
              if(_.isFinite(h[metric])) {
                h[metric] = h[metric] * scaling
              } else {
                h[metric] = null
              }
            }
            return h
          }, Object.assign({}, f))
        })
      case 'ratesScale':
        return data.map((f) => {
          return Series.RATES.reduce((h, rate) => {
            if(h.hasOwnProperty(rate)) {
              if(_.isFinite(h[rate])) {
                h[rate] = h[rate] * args[0]
              } else {
                h[rate] = null
              }
            }
            return h
          }, Object.assign({}, f))
        })
      case 'deltize':
        let period = (args[0]) ? args[0] : 1

        return data.map((curr, fidx, arr) => {
          let prev = arr[fidx-period]
          return Series.METRICS.reduce((h, metric) => {
            if(h.hasOwnProperty(metric)) {
              if(_.isFinite(curr[metric]) && prev && _.isFinite(prev[metric]) && prev[metric] > 0) {
                h[metric] = curr[metric] - prev[metric]
              } else {
                h[metric] = null
              }
            }
            return h
          }, Object.assign({}, curr))
        })

      //CRZ: TODO: is it possible instead to do .deltize().percentize()?
      case 'deltaPercentize':
        return data.map((curr, fidx, arr) => {
          let prev = arr[fidx-1]

          return Series.METRICS.reduce((h, metric) => {
            if(h.hasOwnProperty(metric)) {
              if(_.isFinite(curr[metric]) && prev && _.isFinite(prev[metric]) && prev[metric] > 0) {
                //CRZ: if i do curr/prev -1 it gives rounding errors
                h[metric] = 100 * (curr[metric] - prev[metric])/prev[metric]
              } else {
                h[metric] = null
              }
            }
            return h
          }, Object.assign({}, curr))
        })
      case 'square':
        return data.map((curr, fidx, arr) => {
          let prev = arr[fidx-1]

          return Series.METRICS.reduce((h, metric) => {
            if(h.hasOwnProperty(metric)) {
              if(prev && _.isFinite(prev[metric]) && prev[metric] > 0) {
                //CRZ: if i do curr/prev -1 it gives rounding errors
                h[metric] = curr[metric] * curr[metric]
              } else {
                h[metric] = null
              }
            }
            return h
          }, Object.assign({}, curr))
        })
      case 'average': 
        let avgDays = args[0]

        let edgeDayFraction, adjacentDayFraction, centeredDayFraction
        switch(avgDays) {
          case 1:
            return data
          case 2:
            [edgeDayFraction, adjacentDayFraction, centeredDayFraction] = [(3/4), (1/4), (1/2)]
            break
          case 3: 
            [edgeDayFraction, adjacentDayFraction, centeredDayFraction] = [(2/3), (1/3), (1/3)]
            break
          default:
            throw new TypeError(`does not support average() with more than 3 days, given ${avgDays}`)
        }

        //TODO: rewrite this monstrosity
        return data.map((e, i, s) => {
          let newEntry = Object.assign({}, e)

          Series.METRICS.forEach(field => {
            if(!_.isFinite(e[field])) {
              newEntry[field] = null
            } else if(i === 0) {
              newEntry[field] = e[field]*edgeDayFraction + s[1][field]*adjacentDayFraction
            } else if(i === s.length-1) {
              newEntry[field] = s[i-1][field]*adjacentDayFraction + s[i][field]*edgeDayFraction
            } else {
              newEntry[field] = s[i-1][field]*adjacentDayFraction + s[i][field]*centeredDayFraction + s[i+1][field]*adjacentDayFraction
            }
          })

          return newEntry
        })
      default: debugger; throw new TypeError(`unknown operation ${type}`)
    }
  }
}

//Terms:
//"Frame index" starts with 0
//"Frame number" starts with 1

Series.INDEXES = ['date']
Series.COUNTS = [ 'collections', 'positives', 'negatives', 'deaths', 'recoveries', 
                  'admissions', 'intensifications', 'ventilations', 'results', 'resolutions']
Series.TOGGLES = ['onVentilator', 'inHospital', 'inICU', 'active', 'pending']
Series.METRICS = Series.TOGGLES.concat(Series.COUNTS)
Series.RATES = ['deathRate', 'positiveRate', 'admissionRate', 'icuRate']
Series.ALL = Series.METRICS.concat(Series.INDEXES, Series.RATES)
Series.DERIVED = Series.RATES.concat(['results', 'resolutions', 'active', 'pending'])
Series.FUNDAMENTAL = _.difference(Series.ALL, Series.DERIVED)
Series.FUNDAMENTAL_METRICS = _.difference(Series.METRICS, Series.DERIVED)

// Series.FIELD_MAP = [
//   ['positives', 'actives'],
//   ['admissions', 'inHospital'],
//   ['ventilations', 'onVentilator'],
//   ['intensifications', 'inICU']
// ]
