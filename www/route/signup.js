const el = require('../el/_el.js')
const event = require('../service/event.js')
const data = require('../service/data.js')
const w3 = require('../service/w3.js')
const http = require('../service/http.js')

const signup = () => {
  const pubkey = data`pubkey`()
  if(!pubkey) return location.hash = '#'

  const nfts = data`nfts`()
  const accounts = [...nfts.boys, ...nfts.girls]

  const moneyDaoLink = `<a href="https://moneydao.team/" target="_blank">MoneyDAO</a>`
  
  const registerId = event.click(async btn => {
    const txEl = event.append(document.body, el.tx_processing())[0]
    let signature
    try{
      signature = await w3.send_tx(w3.Cost.Signup)
    } catch (err) {
      console.error(err)
      document.body.removeChild(txEl)
      return undefined
    }
    const userId = data`pubkey`().toString()
    try {
      const res = await http.post('signup', {
        txId: signature,
        userId
      })
      console.log(res)
    } catch (err) {
      console.error(err)
    }
      document.body.removeChild(txEl)
  })
  
  return el.route(
    el.row(
      el.col('s12 m7 l8 home-tile white-text',
        el.col('s12', `
          <h1>Signup</h1>
          <h6>${pubkey.toString().substring(0, 21) + '...'}</h6>
          <br>
          <h5>Todd Lewis Studio</h5>
          <a target="_blank" class="waves-effect waves-light btn col s12 deep-purple lighten-2" href="https://twitter.com/ToddLewisStudio">Twitter</a>
          <a target="_blank" class="waves-effect waves-light btn col s12 deep-purple lighten-2" href="https://moneydao.team">MoneyDAO</a>
        `)
      ),
      el.col('s12 m5 l4 home-tile',
        el.col('s12',
          el.card('', `
            <b>Register</b>
            <ul class="browser-default">
              <li>Full access to <b>Paint Persona</b></li>
              <li>Donate ${el.cost('0.25', 18)} to ${moneyDaoLink}</li>
            </ul>
            <button id="${registerId}" class="waves-effect waves-light btn col s12 black">${el.cost('1.25', 18)}</button>
          `)
        )
      )
    )
  )
}
module.exports = signup