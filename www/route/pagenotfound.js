const el = require('../el/_el.js')
const data = require('../service/data.js')

module.exports = () => {
  const pubkey = data`pubkey`()

  const route = el.route(
    el.card('',
      `<h1>Page not found</h1>
      ${pubkey
      ? `<a href="#battle">Battler</a>`
      : `<a href="#">Home</a>` 
      }`
    )
  )

  return el.nav(route, true, false)
}
