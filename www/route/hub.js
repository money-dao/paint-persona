const el = require('../el/_el.js')
const event = require('../service/event.js')
const data = require('../service/data.js')
const http = require('../service/http.js')
const battler = require('../service/diamondbattler.js')

const hub = () => {
  const pubkey = data`pubkey`()
  if(!pubkey) return location.hash = '#'

  const nfts = data`nfts`()
  const accounts = [...nfts.boys, ...nfts.girls]

  const mbCardRowId = nft => event.click(() => {
    data`profile`({
      img: nft.image,
      title: nft.name,
      nft
    })
    location.hash = '#browse'
  })

  const refresh = async () => {
    const mbAr = accounts.map(nft => nft.address.toString())
    const revenue = await http.post('loadrevenue', {mbAr})
    Object.keys(revenue).forEach(key => {
      const e = document.getElementById(key)
      e.innerHTML = el.cost(revenue[key].likes, 18)
    })    
  }
  event.fn(refresh)
  
  const mbCards = () => accounts.map(nft => `
      <tr class="row hoverable" id="${mbCardRowId(nft)}">
        <td class="col s5 m2"><img class="col s12" src="${nft.image}"></td>
        <td class="col s4 m6">${nft.name}</td>
        <td class="col s3" id="${nft.address.toString()}">${el.cost('0', 18)}</td>
      </tr>
    `
  ).join('')
  
  const route = el.route(
    el.row(
      el.card('blue lighten-3', 
        `<table class="highlight">
          <thead>
            <tr class="row">
                <th class="col s5 m3">NFT</th>
                <th class="col s4 m6">Name</th>
                <th class="col s3">Earnings</th>
            </tr>
          </thead>

          <tbody>
            ${mbCards()}
          </tbody>
        </table>`
      )
    )
  )
  
  return el.nav(route, true, true)
}
module.exports = hub