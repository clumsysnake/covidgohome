const percentDisplay = (num, n) => Number.parseFloat(num).toFixed(1)
const percentTickFormatter = (n) => `${n}%`
const countTickFormatter = (n) => {
  if(n >= 1000000) {
    let decimals = (n % 1000000 === 0) ? 0 : 1
    let x = Number.parseFloat(n/1000000).toFixed(decimals)
    return x + 'm'
  }
  else if(n >= 1000) {
    let decimals = (n % 1000 === 0) ? 0 : 1
    let x = Number.parseFloat(n/1000).toFixed(decimals)
    return x + 'k'
  } else if(n >= 100) {
    return Number.parseFloat(n).toFixed(0)
  } else {
    return n
  }
}
const dateTickFormatter = (date) => {
  return date.toString().slice(5, 6) + "-" + date.toString().slice(6, 8)
}

export {percentDisplay, percentTickFormatter, countTickFormatter, dateTickFormatter}