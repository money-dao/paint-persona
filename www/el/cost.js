const sol = require('./sol.js')

module.exports = (amount, size) => `
  <span class="sol-cost">
    <b>${amount}</b>
    ${sol(size)}
  </span>
`