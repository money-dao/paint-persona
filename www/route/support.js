const el = require('../el/_el.js')
const event = require('../service/event.js')
const data = require('../service/data.js')
const http = require('../service/http.js')

const support = () => {
  const pubkey = data`pubkey`()
  if(!pubkey) return location.hash = '#'

  const support = el.route(
    el.row(
      el.card('',`
        <h1>Contact</h1>
        ${el.row(`
          <b>Email</b>
          <br>
          <small>Email todd.lewis.art@gmail.com with the subject "Paint Person Support" and include your wallet publicKey</small>
        `)}
        ${el.row(`
          <a 
            href="https://solscan.io/account/${pubkey.toString()}#solTransfers" 
            target="_blank"
            class="waves-effect waves-light btn col s12 deep-purple lighten-2">
            Recent Transactions
          </a>
        `)}
        ${el.row(`
          <a 
            href="mailto:todd.lewis.art@gmail.com?subject=Paint%20Persona%20Support&body=wallet:%20${pubkey.toString()}" 
            class="waves-effect waves-light btn col s12 deep-purple lighten-2">
            Email
          </a>
        `)}
      `)
    )
  )
  
  return el.nav(support, true, false)
}
module.exports = support