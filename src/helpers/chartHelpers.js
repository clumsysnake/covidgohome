import { scaleLinear, scaleLog, scaleSqrt } from "d3-scale";
import _ from 'lodash'

//TODO: lots of formatters, can we combine? messy. percentDisplay is cruft.

const numberWithCommas = (n) => {
  return n.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const withPlaces = (num, n) => Number.parseFloat(num).toFixed(n)
const percentDisplay = (num, n) => withPlaces(num, n)
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
const dateTickFormatter = (date) => {
  return date.toString().slice(5, 6) + "-" + date.toString().slice(6, 8)
}

//CRZ: return exactly null if value is not finite, limit to max dec places, but dont use dec places if zero
const safeSmartNumPlaces = (value, maxPlaces) => {
  if(!_.isFinite(value)) { return null }

  //TODO: this works in only the case where maxPlaces = 1 and value is integer. do all cases
  let maxPlacesValue = withPlaces(value, maxPlaces)
  return (maxPlacesValue % 1 === 0) ? withPlaces(maxPlacesValue, 0) : maxPlacesValue
}

const tooltipFormatter = (value, name) => {
  switch(name) {
    case "posPerc":
      return `${safeSmartNumPlaces(value, 1)}%`
    default:
      return safeSmartNumPlaces(value, 1)
  }
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

export {numberWithCommas, safeSmartNumPlaces, withPlaces, percentDisplay, tooltipFormatter, percentTickFormatter, countTickFormatter, dateTickFormatter}