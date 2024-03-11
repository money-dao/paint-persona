const row = require('./row.js')

const disabled = (index, val) => index === val ? ' disabled' : ''

module.exports = href => row(`
  <div class="center">
    <a href="#battle" class="waves-effect waves-light btn${disabled(href, 'battle')}">Battle</a>
    <a href="#dbhx" class="waves-effect waves-light btn${disabled(href, 'dbhx')}">History</a>
    <a href="#dbsearch" class="waves-effect waves-light btn${disabled(href, 'dbsearch')}">Search</a>
  </div>
`)
