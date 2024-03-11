const d = {}

const data = (...e) => {
  const key = e[0][0]
  return val => {
    if(key === '*') return d
    if(val) d[key] = val 
    return d[key]
  }
}

module.exports = data
