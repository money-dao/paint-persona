const el = require('../el/_el.js')
const event = require('../service/event.js')
const data = require('../service/data.js')

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
    location.hash = '#profile'
  })
  
  const mbCards = () => accounts.map(nft => `
      <tr class="row hoverable" id="${mbCardRowId(nft)}">
        <td class="col s3 m2"><img class="col s12" src="${nft.image}"></td>
        <td class="col s5 m6">${nft.name}</td>
        <td class="col s4">0 sol</td>
      </tr>
    `
  ).join('')
  
  return el.nav(
    el.route(
      el.row(
        el.card('blue lighten-3', 
          `<table class="highlight">
            <thead>
              <tr class="row">
                  <th class="col s3 m2">NFT</th>
                  <th class="col s5 m6">Name</th>
                  <th class="col s4">Revenue</th>
              </tr>
            </thead>

            <tbody>
              ${mbCards()}
            </tbody>
          </table>`
        )
      ),
      el.footer()
    )
  )
}
module.exports = hub