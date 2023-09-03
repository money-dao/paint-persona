const card = require('./card.js')
const sol = require('./sol.js')

module.exports = () => card('tx-processing black white-text', 
  `
    <b>${sol(18)} Transaction Processing...</b>
    <div>Do not close or refresh this window.</div>
    <div>This may take several seconds.</div>
  `
)
