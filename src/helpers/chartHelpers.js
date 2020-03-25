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
  } else {
    return n
  }
}

export {percentDisplay, percentTickFormatter, countTickFormatter}