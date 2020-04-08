import { scaleLinear, scaleLog, scaleSqrt } from "d3-scale";
import _ from 'lodash'
import moment from 'moment'

//TODO: lots of formatters, can we combine? messy. percentDisplay is cruft.

const numberWithCommas = (n) => {
  if(!_.isFinite(n)) { return n } // this makes it easier to use in inline jsx

  return n.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const percentWithPlaces = (n, places) => {
  if(!_.isFinite(n)) { return n }

  return withPlaces(n, places) + "%"
}

const withPlaces = (n, places) => { 
  if(!_.isFinite(n)) { return n }

  return Number.parseFloat(n).toFixed(places)
}
const percentDisplay = (n, places) => withPlaces(n, places)
const percentTickFormatter = (n) => `${n}%`
const countTickFormatter = (n) => {
  if(n >= 1000000) {
    let decimals = (n % 1000000 === 0) ? 0 : 1
    let x = withPlaces(n/1000000, decimals)
    return x + 'm'
  }
  else if(n >= 1000) {
    let decimals = (n % 1000 === 0) ? 0 : 1
    let x = withPlaces(n/1000, decimals)
    return x + 'k'
  } else if(n >= 100) {
    return withPlaces(n, 0)
  } else if(n === 0) {
    return withPlaces(0, 0)
  } else if(n < 1) {
    return withPlaces(n, 2)
  } else {
    return safeSmartNumPlaces(n, 1)
  }
}

//expects second since epoch
const dateTickFormatter = (date) => {
  if(!_.isInteger(date)) {
    throw new TypeError(`cannot format date because given non-integer: ${date}`)
  }

  return moment(date, 'YYYYMMDD').format('M-DD')
}

//CRZ: return exactly null if value is not finite, limit to max dec places, but dont use dec places if zero
const safeSmartNumPlaces = (value, maxPlaces) => {
  if(!_.isFinite(value)) { return null }

  //TODO: this works in only the case where maxPlaces = 1 and value is integer. do all cases
  return _.isInteger(value) ? withPlaces(value, 0) : withPlaces(value, maxPlaces)
}

const tooltipFormatter = (value, name) => {
  return safeSmartNumPlaces(value, 1)
}

export function colorScale(scaleType, max) {
  let f;
  switch(scaleType) {
    case 'linear':
      f = scaleLinear([0, max], ["white", "red"]); break;
    case 'log2':
      f = scaleLog([1,max],["white", "red"]).base(2); break;
    case 'sqrt':
      f = scaleSqrt([1, max], ['white', 'red']); break;
    default:
      throw new TypeError(`error, unknown colorScale ${scaleType}`)
  }

  return (x) => (x === 0) ? "white" : f(x)
}

export {numberWithCommas, safeSmartNumPlaces, withPlaces, percentWithPlaces, percentDisplay, tooltipFormatter, percentTickFormatter, countTickFormatter, dateTickFormatter}