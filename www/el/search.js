const data = require('../service/data.js')
const event = require('../service/event.js')
const w3 = require('../service/w3.js')

const search = () => {

  const searchId = event.el(()=>{})
  
  const goId = event.click(async () => {
    const search = document.querySelector(`#${searchId}`)
    let nfts = await w3.get_nfts(search.value)
    if(nfts) {
      nfts = Object.values(nfts)    
      const nft = nfts[0]
      data`profile`({
        img: nft.image,
        title: nft.name,
        nft
      })
      location.hash = '#profile'
    } else {
      location.hash = '#profilenotfound'
    }
  })
  
  return ` <form class="row white flex v-center">
    <div class="col s9">
      <div class="input-field">
        <i class="material-icons prefix active">search</i>
        <input id="${searchId}" class="validate">
        <label for="${searchId}" class="active">Search Moneyboy</label>
      </div>
    </div>
    <div class="col s3">
      <button id="${goId}" class="waves-effect waves-light btn col s12 deep-purple lighten-2">Go</button>
    </div>
  </form>`
}
module.exports = search
